#!/usr/bin/env python3
"""Ensure CI dependencies stay immutable and minimally privileged."""

from pathlib import Path
import re


workflows = sorted(Path(".github/workflows").glob("*.yml"))
assert workflows, "No workflows found"

for path in workflows:
    text = path.read_text(encoding="utf-8")
    assert re.search(r"(?m)^permissions:\n  contents: read$", text), f"{path}: contents permission must be read-only"

    uses = re.findall(r"(?m)^\s*-?\s*uses:\s*([^\s#]+)", text)
    for action in uses:
        if action.startswith("./"):
            continue
        assert re.search(r"@[0-9a-f]{40}$", action), f"{path}: action is not pinned to a full commit SHA: {action}"

    checkout_count = sum(action.startswith("actions/checkout@") for action in uses)
    if checkout_count:
        assert text.count("persist-credentials: false") >= checkout_count, f"{path}: checkout credentials must not persist"

secret_scan = Path(".github/workflows/secret-scan.yml").read_text(encoding="utf-8")
assert re.search(r"zricethezav/gitleaks:v[0-9.]+@sha256:[0-9a-f]{64}", secret_scan), "Gitleaks image must be pinned by digest"
assert "fetch-depth: 0" in secret_scan, "Gitleaks must scan the complete Git history"

dependabot = Path(".github/dependabot.yml").read_text(encoding="utf-8")
assert "package-ecosystem: github-actions" in dependabot, "Dependabot must monitor Actions"
print(f"CI dependency and permission audit passed for {len(workflows)} workflows")
