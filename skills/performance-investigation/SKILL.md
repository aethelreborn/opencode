---
name: performance-investigation
description: Use when something is slow, a query takes too long, a page load regresses, memory grows, or someone asks to "make it faster". Enforces measure-profile-fix-remeasure with real commands and a recorded baseline, so speed claims are evidence, not opinion.
---

# Performance Investigation

No optimization without a measurement. No claim without a re-measurement.

## 1. Define the metric and the target

Bad: "make it faster". Good: "p95 latency of `GET /search` at 50 rps is 1,240ms; target < 300ms; current throughput 40 rps; budget 150MB RSS".

Record the baseline with the exact command and hardware/container limits. Pin the dataset size — a benchmark on 100 rows predicts nothing about 10M.

## 2. Measure at the right layer

**Backend latency**

```bash
# quick and dirty, concurrency 50, 30s
npx autocannon -c 50 -d 30 http://localhost:3000/api/search?q=test

# with latency distribution
wrk -t4 -c50 -d30s --latency http://localhost:3000/api/search

# k6 for scenarios and thresholds
k6 run --vus 50 --duration 30s script.js
```

**Database**

```sql
EXPLAIN (ANALYZE, BUFFERS) SELECT ...;         -- look for Seq Scan, rows removed by filter
SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;
```

**CPU profile (the only way to know where time goes)**

```bash
node --cpu-prof --cpu-prof-dir=./prof app.js    # then open in chrome://inspect or speedscope
py-spy record -o profile.svg -- python app.py
go tool pprof -http=:8080 http://localhost:6060/debug/pprof/profile?seconds=30
cargo flamegraph --bin app
perf record -F 99 -g -- ./app && perf report
```

**Frontend**

```bash
npx lighthouse http://localhost:3000 --only-categories=performance --preset=desktop --output=json --output-path=./lh.json
jq '.audits | to_entries[] | select(.value.score != null and .value.score < 0.9) | {id: .key, score: .value.score, ms: .value.numericValue}' lh.json
```

Or the chrome-devtools MCP tools: `performance_start_trace` → interact → `performance_stop_trace` → `performance_analyze_insight`. Check Largest Contentful Paint, Total Blocking Time, and network waterfall; look for re-render storms in the React profiler before blaming the backend.

**Memory**

```bash
node --inspect app.js          # take two heap snapshots 60s apart, diff retained size
kubectl top pod app            # RSS over time
docker stats --no-stream
```

## 3. Find the actual bottleneck

In order, because this is where 90% of wins are:

1. **N+1 queries.** Log query counts per request; one endpoint firing 200 queries is the classic.
2. **Missing index / wrong index.** `EXPLAIN ANALYZE`, then `CREATE INDEX CONCURRENTLY` on the filtered+sorted columns.
3. **Work in a loop that belongs outside it** (parsing, formatting, regex compilation, JSON round-trips).
4. **Unbounded payloads.** Selecting `*`, returning 10k rows, shipping 2MB of JS.
5. **Synchronous I/O on the hot path** (sync file reads, blocking HTTP, `await` inside a loop that could be `Promise.all` with a concurrency cap).
6. **Recomputation** without memoization on genuinely expensive, stable inputs.
7. **Connection pool exhaustion** — check `pg_stat_activity` and pool metrics before optimizing queries.
8. **Cold starts / bundle size** for serverless and frontend.

## 4. Fix one thing, re-measure

Apply a single change, rerun the *same* benchmark, record before/after in the same units. Revert anything that does not move the metric — complexity must be paid for with measured gains.

Rules:
- Keep correctness: run the test suite after each optimization; optimized code paths love to drop edge cases.
- Prefer algorithmic and query-level fixes to micro-tuning.
- Cache only with an invalidation story and a measured hit rate; a cache is a consistency bug waiting to happen.
- Add a performance regression test or budget to CI (bundle size limit, k6 threshold, query count assertion) so the win does not silently rot.

## 5. Report

```
Metric:    p95 GET /search @50rps   1240ms → 260ms   (-79%)
Method:    autocannon -c 50 -d 30; dataset 1.0M rows
Cause:     N+1 in SearchService.enrich() (201 queries/request)
Fix:       single batched query + composite index (file:line)
Proof:     EXPLAIN shows Index Scan; 214 tests pass; p99 410ms
Residual:  cold-cache p95 380ms; next bottleneck is JSON serialization
```

## Anti-patterns

- Optimizing without a profile ("this looks slow").
- Micro-benchmarking a function that is 2% of the request.
- Adding a cache as the first resort.
- Comparing numbers from different datasets, machines, or concurrency.
- Declaring victory from a single local run under no load.
