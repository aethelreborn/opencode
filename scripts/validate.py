#!/usr/bin/env python3
"""Validate this opencode config: schema, agents, commands, skills, and MCP wiring."""
from __future__ import annotations

import json
import re
import sys
import urllib.request
from pathlib import Path

import yaml
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parent.parent
SCHEMA_URL = "https://opencode.ai/config.json"
SCHEMA_CACHE = ROOT / ".cache" / "opencode-schema.json"

SKILL_NAME = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
MODEL_REF = re.compile(r"^[^/#]+/[^#]+(?:#[^#]+)?$")
AGENT_KEYS = {
    "name", "model", "variant", "description", "mode", "hidden", "color",
    "steps", "options", "permission", "disable", "temperature", "top_p",
}
COMMAND_KEYS = {"description", "agent", "model", "variant", "subtask"}
PERMISSION_KEYS = {
    "read", "edit", "glob", "grep", "list", "bash", "task", "external_directory",
    "todowrite", "question", "webfetch", "websearch", "lsp", "doom_loop", "skill",
}
BUILTIN_AGENTS = {"build", "plan", "general", "explore"}

failures: list[str] = []
warnings: list[str] = []
checked = {"config": 0, "agents": 0, "commands": 0, "skills": 0, "mcp": 0}


def fail(message: str) -> None:
    failures.append(message)


def warn(message: str) -> None:
    warnings.append(message)


def strip_jsonc(text: str) -> str:
    out = []
    i = 0
    in_string = False
    while i < len(text):
        char = text[i]
        if in_string:
            out.append(char)
            if char == "\\":
                i += 1
                if i < len(text):
                    out.append(text[i])
            elif char == '"':
                in_string = False
        else:
            if char == '"':
                in_string = True
                out.append(char)
            elif text.startswith("//", i):
                while i < len(text) and text[i] != "\n":
                    i += 1
                continue
            elif text.startswith("/*", i):
                end = text.find("*/", i + 2)
                i = len(text) if end == -1 else end + 2
                continue
            else:
                out.append(char)
        i += 1
    return re.sub(r",(\s*[}\]])", r"\1", "".join(out))


def load_schema() -> dict:
    SCHEMA_CACHE.parent.mkdir(exist_ok=True)
    if not SCHEMA_CACHE.exists():
        request = urllib.request.Request(
            SCHEMA_URL,
            headers={"User-Agent": "opencode-config-validator/1.0", "Accept": "application/json"},
        )
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                SCHEMA_CACHE.write_bytes(response.read())
        except OSError as error:
            raise SystemExit(
                f"cannot fetch {SCHEMA_URL} ({error}); place a copy at {SCHEMA_CACHE}"
            ) from error
    return json.loads(SCHEMA_CACHE.read_text())


def drop_remote_refs(node):
    # The schema references https://models.dev for model shapes; strip those so
    # validation works offline. Structural checks still apply.
    if isinstance(node, dict):
        if isinstance(node.get("$ref"), str) and node["$ref"].startswith("http"):
            return {}
        return {key: drop_remote_refs(value) for key, value in node.items()}
    if isinstance(node, list):
        return [drop_remote_refs(value) for value in node]
    return node


def frontmatter(path: Path) -> tuple[dict, str]:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return {}, text
    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}, text
    try:
        data = yaml.safe_load(parts[1]) or {}
    except yaml.YAMLError as error:
        fail(f"{path.relative_to(ROOT)}: invalid frontmatter: {error}")
        return {}, parts[2]
    if not isinstance(data, dict):
        fail(f"{path.relative_to(ROOT)}: frontmatter must be a mapping")
        return {}, parts[2]
    return data, parts[2]


def validate_config() -> dict:
    path = ROOT / "opencode.jsonc"
    try:
        config = json.loads(strip_jsonc(path.read_text(encoding="utf-8")))
    except json.JSONDecodeError as error:
        fail(f"opencode.jsonc: invalid JSON: {error}")
        return {}

    schema = drop_remote_refs(load_schema())
    errors = sorted(Draft202012Validator(schema).iter_errors(config), key=lambda e: list(e.path))
    for error in errors:
        location = "/".join(str(part) for part in error.path) or "<root>"
        fail(f"opencode.jsonc: {location}: {error.message}")
    checked["config"] += 1

    if config.get("$schema") != SCHEMA_URL:
        fail("opencode.jsonc: $schema must be set to the live schema URL")

    default_agent = config.get("default_agent")
    if default_agent and not (ROOT / "agent" / f"{default_agent}.md").exists():
        fail(f"opencode.jsonc: default_agent '{default_agent}' has no agent file")

    for entry in config.get("plugin", []):
        if isinstance(entry, str) and not entry.strip():
            fail("opencode.jsonc: empty plugin entry")

    for name, server in (config.get("mcp") or {}).items():
        checked["mcp"] += 1
        kind = server.get("type")
        if kind not in {"local", "remote"}:
            fail(f"mcp.{name}: type must be 'local' or 'remote' (got {kind!r})")
            continue
        if kind == "local":
            command = server.get("command")
            if not isinstance(command, list) or not command:
                fail(f"mcp.{name}: command must be a non-empty array")
                continue
            binary = command[0]
            if binary.startswith(("/", "~")) and not Path(binary).exists():
                fail(f"mcp.{name}: binary not found on this machine: {binary}")
        else:
            url = server.get("url", "")
            if not url.startswith("https://"):
                fail(f"mcp.{name}: remote url must be https")
            if "{env:" not in url and name in {"github"} and "headers" not in server:
                fail(f"mcp.{name}: expected an auth header")
    return config


def validate_agents() -> None:
    for path in sorted((ROOT / "agent").glob("*.md")):
        data, _ = frontmatter(path)
        name = path.stem
        checked["agents"] += 1
        if not data.get("description"):
            fail(f"agent/{name}.md: missing description")
        if data.get("mode") not in {"primary", "subagent", "all"}:
            fail(f"agent/{name}.md: mode must be primary, subagent, or all (got {data.get('mode')!r})")
        model = data.get("model")
        if model and not MODEL_REF.match(str(model)):
            fail(f"agent/{name}.md: model must look like provider/model (got {model!r})")
        unknown = set(data) - AGENT_KEYS
        if unknown:
            warn(f"agent/{name}.md: unknown frontmatter keys routed to options: {sorted(unknown)}")
        permission = data.get("permission") or {}
        if isinstance(permission, dict):
            bad = set(permission) - PERMISSION_KEYS
            if bad:
                fail(f"agent/{name}.md: unknown permission keys: {sorted(bad)}")
        elif not isinstance(permission, str):
            fail(f"agent/{name}.md: permission must be a mapping or action string")


def validate_commands() -> None:
    agents = {path.stem for path in (ROOT / "agent").glob("*.md")}
    for path in sorted((ROOT / "command").glob("*.md")):
        data, body = frontmatter(path)
        name = path.stem
        checked["commands"] += 1
        if not data.get("description"):
            fail(f"command/{name}.md: missing description")
        if not body.strip():
            fail(f"command/{name}.md: empty template body")
        target = data.get("agent")
        if target and target not in agents and target not in BUILTIN_AGENTS:
            fail(f"command/{name}.md: agent '{target}' does not exist")
        unknown = set(data) - COMMAND_KEYS - {"permission"}
        if unknown:
            warn(f"command/{name}.md: unknown frontmatter keys: {sorted(unknown)}")


def validate_skills() -> None:
    for path in sorted((ROOT / "skills").glob("*/SKILL.md")):
        data, body = frontmatter(path)
        folder = path.parent.name
        checked["skills"] += 1
        name = data.get("name")
        if name != folder:
            fail(f"skills/{folder}: frontmatter name {name!r} must match folder name")
        if not isinstance(name, str) or not SKILL_NAME.match(name):
            fail(f"skills/{folder}: name must be lowercase hyphenated")
        description = (data.get("description") or "").strip()
        if not description:
            fail(f"skills/{folder}: missing description (skill would be filtered out)")
        elif len(description) < 60:
            fail(f"skills/{folder}: description too short to trigger reliably ({len(description)} chars)")
        elif len(description) > 1024:
            fail(f"skills/{folder}: description exceeds 1024 chars")
        if "Use when" not in description and "Use ONLY when" not in description:
            warn(f"skills/{folder}: description does not state when to use it")
        if len(body.split()) < 80:
            warn(f"skills/{folder}: body is short ({len(body.split())} words)")


def main() -> int:
    validate_config()
    validate_agents()
    validate_commands()
    validate_skills()

    for message in warnings:
        print(f"WARN  {message}")
    for message in failures:
        print(f"FAIL  {message}")

    print(
        f"\nconfig {checked['config']} · agents {checked['agents']} · commands {checked['commands']}"
        f" · skills {checked['skills']} · mcp {checked['mcp']}"
    )
    print(f"{len(failures)} failure(s), {len(warnings)} warning(s)")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
