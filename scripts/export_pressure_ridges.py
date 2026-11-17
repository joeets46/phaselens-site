#!/usr/bin/env python3
"""Export pressure events per match per minute for the footer's ridges.

Reads, read-only, the local phaselens data (never writes or changes anything there):

  pilots/euro2024_knockout_stage.json        which fifteen matches, and the pinned commit
  manifests/statsbomb/open-data/<c>/match_<m>.json   SHA-256 of each raw file
  data/raw/statsbomb/open-data/<c>/data/events/<m>.json         the events
  data/raw/statsbomb/open-data/<c>/data/matches/55/282.json     the match list (teams, stage)
  data/processed/metrics/<c>/<m>/run_summary.json and player_match_metrics.csv
                                             phaselens's own pressure_event_count, to reconcile with

The count follows phaselens docs/metric_catalog.md, section pressure_event_count, exactly:

    pressure_event_count = sum over events e in E(c, m) of 1[type(e) = 17] * 1[team(e) = t] * 1[player(e) = p]

with type(e) = e.type.id. Nothing else filters the events: no period, minute or player filter.
Here the events are bucketed by their own `period` and `minute` fields instead of by player.

Before anything is written, the counts are reconciled with phaselens's metrics outputs: per match
(total), per team and per player. If a single number differs, the script stops and writes nothing.

Output: src/data/pressure-ridges.json in this repo. Only aggregated counts: no raw events, no
player data.

Usage:  python scripts/export_pressure_ridges.py            (default phaselens folder below)
        PHASELENS_DIR=D:\\other\\phaselens python scripts/export_pressure_ridges.py
"""

from __future__ import annotations

import csv
import datetime
import hashlib
import json
import os
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.dont_write_bytecode = True

PHASELENS = Path(os.environ.get("PHASELENS_DIR", r"C:\Users\ASUS\phaselens"))
REPO = Path(__file__).resolve().parent.parent
OUT = REPO / "src" / "data" / "pressure-ridges.json"
PRESSURE = 17  # events.type.id of "Pressure" (provider Events v4.0.0 p. 4)


class Stop(Exception):
    """A check failed: nothing is written."""


def read_json(path: Path):
    with open(path, "rb") as f:  # read-only
        return json.loads(f.read().decode("utf-8"))


def sha256_of(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def phaselens_head() -> str | None:
    """phaselens's current commit, read straight from .git (no git command, so nothing is touched)."""
    git = PHASELENS / ".git"
    try:
        head = (git / "HEAD").read_text(encoding="utf-8").strip()
        if not head.startswith("ref:"):
            return head
        ref = head.split(" ", 1)[1].strip()
        ref_file = git / ref
        if ref_file.exists():
            return ref_file.read_text(encoding="utf-8").strip()
        for line in (git / "packed-refs").read_text(encoding="utf-8").splitlines():
            if line.endswith(" " + ref):
                return line.split(" ", 1)[0]
    except OSError:
        return None
    return None


def verified_events_path(commit: str, match_id: int) -> Path:
    """The events file, checked against the SHA-256 and size in its manifest."""
    manifest = read_json(PHASELENS / "manifests" / "statsbomb" / "open-data" / commit / f"match_{match_id}.json")
    wanted = f"data/events/{match_id}.json"
    record = next((r for r in manifest["files"] if r["source_path"] == wanted), None)
    if record is None:
        raise Stop(f"match {match_id}: manifest has no record of {wanted}")
    path = PHASELENS / record["local_path"]
    if path.stat().st_size != record["size_bytes"] or sha256_of(path) != record["sha256"]:
        raise Stop(f"match {match_id}: events file does not match its manifest (size or SHA-256)")
    return path


def main() -> int:
    pilot = read_json(PHASELENS / "pilots" / "euro2024_knockout_stage.json")
    commit = pilot["source_commit"]
    match_ids = pilot["match_ids"]
    if len(match_ids) != 15:
        raise Stop(f"the pilot lists {len(match_ids)} matches, expected 15")

    raw = PHASELENS / "data" / "raw" / "statsbomb" / "open-data" / commit / "data"
    metrics_dir = PHASELENS / "data" / "processed" / "metrics" / commit

    match_list = {m["match_id"]: m for m in read_json(raw / "matches" / f"{pilot['competition_id']}" / f"{pilot['season_id']}.json")}

    matches = []
    report = []
    for match_id in match_ids:
        info = match_list[match_id]
        events = read_json(verified_events_path(commit, match_id))

        # Every period's first and last minute come from all of its events, so quiet minutes at the
        # end of a period are kept as zeros instead of being cut off.
        span: dict[int, list[int]] = {}
        per_minute: dict[tuple[int, int], int] = Counter()
        per_team: Counter = Counter()
        per_player: Counter = Counter()
        for e in events:
            period, minute = e["period"], e["minute"]
            lo_hi = span.setdefault(period, [minute, minute])
            lo_hi[0], lo_hi[1] = min(lo_hi[0], minute), max(lo_hi[1], minute)
            if e["type"]["id"] != PRESSURE:
                continue
            team, player = e.get("team", {}).get("id"), e.get("player", {}).get("id")
            if team is None or player is None:
                raise Stop(f"match {match_id}: a Pressure event without team or player (event {e.get('id')})")
            per_minute[(period, minute)] += 1
            per_team[team] += 1
            per_player[player] += 1
        total = sum(per_minute.values())

        # --- reconcile with phaselens's own outputs: match total, teams, players ---
        summary = read_json(metrics_dir / str(match_id) / "run_summary.json")
        if summary["match_id"] != match_id or summary["source_commit"] != commit:
            raise Stop(f"match {match_id}: run_summary.json is for another match or commit")
        theirs = summary["metric_totals"]["pressure_event_count"]
        if total != theirs:
            raise Stop(f"match {match_id}: per-minute counts sum to {total}, phaselens total is {theirs}")
        theirs_team = {t["team_id"]: t["metric_totals"]["pressure_event_count"] for t in summary["teams"]}
        if {k: v for k, v in per_team.items()} != {k: v for k, v in theirs_team.items() if v} :
            raise Stop(f"match {match_id}: team totals differ: {dict(per_team)} vs {theirs_team}")
        csv_players: dict[int, int] = defaultdict(int)
        with open(metrics_dir / str(match_id) / "player_match_metrics.csv", "rb") as f:  # read-only
            for row in csv.DictReader(f.read().decode("utf-8").splitlines()):
                csv_players[int(row["player_id"])] += int(row["pressure_event_count"])
        if dict(per_player) != {k: v for k, v in csv_players.items() if v}:
            raise Stop(f"match {match_id}: per-player counts differ from player_match_metrics.csv")

        periods = []
        for period in sorted(span):
            lo, hi = span[period]
            counts = [per_minute.get((period, m), 0) for m in range(lo, hi + 1)]
            if period >= 5 and sum(counts) == 0:
                continue  # a penalty shoot-out holds no Pressure events: nothing to draw
            periods.append({"period": period, "first_minute": lo, "counts": counts})
        if sum(sum(p["counts"]) for p in periods) != total:
            raise Stop(f"match {match_id}: counts dropped by the periods step")

        label = f"{info['home_team']['home_team_name']} v {info['away_team']['away_team_name']}"
        matches.append(
            {
                "match_id": match_id,
                "label": label,
                "stage": info["competition_stage"]["name"],
                "match_date": info["match_date"],
                "source_commit": commit,
                "total": total,
                "periods": periods,
            }
        )
        report.append((match_id, f"{label} ({info['competition_stage']['name']})", total, theirs, sorted(span)))

    # ---- report ----
    print(f"phaselens {phaselens_head()}  source commit {commit}\n")
    print(f"{'match_id':>9}  {'match':<44} {'mine':>5} {'phaselens':>9}  periods  ok")
    for mid, label, mine, theirs, periods in report:
        print(f"{mid:>9}  {label:<44} {mine:>5} {theirs:>9}  {','.join(map(str, periods)):<7}  {'yes' if mine == theirs else 'NO'}")
    print(f"\n15 of 15 totals match; team totals and per-player counts match too. Sum of all 15: {sum(r[2] for r in report)}")

    # ---- write (only inside this repo) ----
    document = {
        "description": (
            "Pressure events per minute for the fifteen knockout matches of UEFA Euro 2024. Only aggregated counts: "
            "no raw events, no player data. The count is phaselens's pressure_event_count (events with type.id 17; "
            "docs/metric_catalog.md), bucketed by each event's own period and minute. Minute 45 can hold first-half "
            "stoppage time and the first minute of the second half, and likewise at 90, 105 and 120."
        ),
        "source": {
            "name": "StatsBomb Open Data",
            "repository_url": "https://github.com/hudl/open-data",
            "commit_sha": commit,
        },
        "derived_with": {
            "project": "https://github.com/joeets46/phaselens",
            "project_commit": phaselens_head(),
            "script": "scripts/export_pressure_ridges.py",
        },
        "exported_on": datetime.date.today().isoformat(),
        "reconciled": "Per match, the counts sum to phaselens's pressure_event_count total; team and player counts also match.",
        "matches": matches,
    }
    text = json.dumps(document, indent=2, ensure_ascii=False)
    # keep each list of counts on one line
    text = re.sub(r"\[\s*(-?\d+(?:,\s*-?\d+)*)\s*\]", lambda m: "[" + re.sub(r"\s+", " ", m.group(1)) + "]", text)
    resolved = OUT.resolve()
    if REPO not in resolved.parents:
        raise Stop("refusing to write outside this repository")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(text + "\n", encoding="utf-8")
    print(f"\nwrote {OUT.relative_to(REPO)} ({len(text) // 1024} KB)")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Stop as problem:
        print(f"\nSTOPPED, nothing written: {problem}", file=sys.stderr)
        sys.exit(1)
