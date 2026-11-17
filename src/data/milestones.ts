/**
 * Milestones M0 to M12, newest first, copied verbatim from the Milestones table in
 * docs/project_brief.md of https://github.com/joeets46/phaselens (main at ce4e624).
 * `doneWhen` keeps the table's own markdown: backticks mark inline code.
 * The docs give no dates, so there are none here. All thirteen are marked "Complete".
 */

export interface Milestone {
  id: string
  goal: string
  doneWhen: string
}

export const MILESTONES: readonly Milestone[] = [
  {
    id: "M12",
    goal: "Euro 2024 knockout stage",
    doneWhen: "The fifteen knockout-stage matches are ingested and verified with their three-sixty data, and the dashboard, its checks, and the documentation cover them, with no new metric or analytical feature",
  },
  {
    id: "M11",
    goal: "Dashboard usability, repeatability, and documentation",
    doneWhen: "A read-only `dashboard-check` command, a repeatable browser checklist, a five-match Overview test, selections kept through language changes, and new-user documentation exist, with no new metric, data source, or analytical feature",
  },
  {
    id: "M10",
    goal: "Dashboard presentation polish",
    doneWhen: "UI/UX, formatting, radius-label placement, responsive layout, accessibility, and documentation are improved, with no new analytical feature",
  },
  {
    id: "M9",
    goal: "Local dashboard",
    doneWhen: "A read-only local app shows the pilot results and the final's frames and context from verified data",
  },
  {
    id: "M8",
    goal: "Event-level spatial context",
    doneWhen: "One row per event of the final with nearest-opponent distance and radius counts of visible players around the actor",
  },
  {
    id: "M7",
    goal: "Three-sixty exploration",
    doneWhen: "The final's three-sixty file is stored with provenance and its linkage, coverage, and structure are reported",
  },
  {
    id: "M6",
    goal: "Five-match pilot",
    doneWhen: "Five matches run through the same pipeline and combine into one verified table",
  },
  {
    id: "M5",
    goal: "Analytical storage",
    doneWhen: "The player-match metrics are queryable in DuckDB via typed Parquet",
  },
  {
    id: "M4",
    goal: "Initial metric implementation",
    doneWhen: "The catalogued event counts are computed to CSV and JSON and reconcile with the source",
  },
  {
    id: "M3",
    goal: "Choose answerable questions",
    doneWhen: "First candidate rows are in the metric catalog",
  },
  {
    id: "M2",
    goal: "Inspect the event schema",
    doneWhen: "Schema notes are written from the actual files",
  },
  {
    id: "M1",
    goal: "Ingest one match",
    doneWhen: "Metadata, lineups, and events are stored raw with a manifest",
  },
  {
    id: "M0",
    goal: "Project skeleton",
    doneWhen: "Repository, environment, and a passing test exist",
  },
]
