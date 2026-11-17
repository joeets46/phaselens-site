import raw from "@/data/pressure-ridges.json"

/*
 * Pressure events per minute for the fifteen Euro 2024 knockout matches (see the "description"
 * in src/data/pressure-ridges.json). Every ridge shares one axis of "slots": each period has a
 * fixed run of slots as long as the longest such period in any match, back to back. Period 1's stoppage minutes and period 2's first minutes both carry minute numbers
 * from 45, so periods are never merged: a slot belongs to exactly one (period, minute).
 */

interface RawPeriod {
  period: number
  first_minute: number
  counts: number[]
}
interface RawMatch {
  match_id: number
  label: string
  stage: string
  total: number
  periods: RawPeriod[]
}

export interface Ridge {
  matchId: number
  label: string
  stage: string
  total: number
  /** Pressure count per slot, or null where this match has no such minute (not played, or a gap). */
  counts: (number | null)[]
  /** The counts lightly smoothed, for the shape of the ridge only. 0 where nothing was played. */
  shape: number[]
}

const GAP = 0
const PERIODS = [1, 2, 3, 4] as const
const matches = raw.matches as RawMatch[]

const periodLength = (period: number) =>
  Math.max(0, ...matches.map((m) => m.periods.find((p) => p.period === period)?.counts.length ?? 0))

export interface Segment {
  period: number
  start: number
  length: number
  firstMinute: number
}

export const SEGMENTS: readonly Segment[] = (() => {
  let start = 0
  return PERIODS.map((period) => {
    const length = periodLength(period)
    const firstMinute = matches.flatMap((m) => m.periods).find((p) => p.period === period)?.first_minute ?? 0
    const seg = { period, start, length, firstMinute }
    start += length + GAP
    return seg
  })
})()

const last = SEGMENTS[SEGMENTS.length - 1]
export const SLOT_COUNT = last.start + last.length

/** Slot index of a (period, minute) pair on the shared axis. */
export const slotOf = (period: number, minute: number) => {
  const seg = SEGMENTS.find((s) => s.period === period)!
  return seg.start + (minute - seg.firstMinute)
}

/** Which period and minute a slot stands for, or null inside the gap between periods. */
export function slotInfo(slot: number): { period: number; minute: number } | null {
  for (const seg of SEGMENTS) {
    if (slot >= seg.start && slot < seg.start + seg.length) {
      return { period: seg.period, minute: seg.firstMinute + (slot - seg.start) }
    }
  }
  return null
}

/** The nearest slot that belongs to a period, for a position that falls in a gap. */
export function snapToPeriod(slot: number) {
  const clamped = Math.max(0, Math.min(SLOT_COUNT - 1, slot))
  if (slotInfo(clamped)) return clamped
  let best = clamped
  let bestDist = Infinity
  for (const seg of SEGMENTS) {
    for (const edge of [seg.start, seg.start + seg.length - 1]) {
      const d = Math.abs(edge - clamped)
      if (d < bestDist) {
        best = edge
        bestDist = d
      }
    }
  }
  return best
}

const PERIOD_NAMES: Record<number, string> = {
  1: "1st half",
  2: "2nd half",
  3: "1st half of extra time",
  4: "2nd half of extra time",
}

const periodEnd = (period: number) => (period === 1 ? 45 : period === 2 ? 90 : period === 3 ? 105 : 120)

/** 67' in regulation play, 45+2' once a period runs past its nominal end. */
const plainLabel = (period: number, minute: number) => {
  const end = periodEnd(period)
  return minute > end ? `${end}+${minute - end}'` : `${minute}'`
}

// Labels that would read the same in two periods (45', 90', 105'): those get the period named.
const sharedLabels = (() => {
  const seen = new Map<string, number>()
  for (const seg of SEGMENTS) {
    for (let i = 0; i < seg.length; i++) {
      const label = plainLabel(seg.period, seg.firstMinute + i)
      seen.set(label, (seen.get(label) ?? 0) + 1)
    }
  }
  return new Set([...seen].filter(([, n]) => n > 1).map(([label]) => label))
})()

export function minuteLabel(period: number, minute: number) {
  const label = plainLabel(period, minute)
  return sharedLabels.has(label) ? `${label} (${PERIOD_NAMES[period]})` : label
}

export function readout(ridge: Ridge, slot: number) {
  const info = slotInfo(slot)
  const n = ridge.counts[slot]
  if (!info || n === null) return null
  return `${ridge.stage} · ${ridge.label} · ${minuteLabel(info.period, info.minute)} · ${n} ${n === 1 ? "pressure" : "pressures"}`
}

function build(m: RawMatch): Ridge {
  const counts: (number | null)[] = new Array(SLOT_COUNT).fill(null)
  const shape: number[] = new Array(SLOT_COUNT).fill(0)
  for (const p of m.periods) {
    const start = slotOf(p.period, p.first_minute)
    p.counts.forEach((c, i) => {
      counts[start + i] = c
    })
    // [1 2 1] smoothing inside the period, renormalised at its two ends.
    p.counts.forEach((c, i) => {
      const prev = p.counts[i - 1]
      const next = p.counts[i + 1]
      let sum = 2 * c
      let weight = 2
      if (prev !== undefined) {
        sum += prev
        weight += 1
      }
      if (next !== undefined) {
        sum += next
        weight += 1
      }
      shape[start + i] = sum / weight
    })
  }
  return { matchId: m.match_id, label: m.label, stage: m.stage, total: m.total, counts, shape }
}

/** Back to front: the semi-finals recede, the final is the nearest ridge. */
export const RIDGES: readonly Ridge[] = [...matches].reverse().map(build)

export const MAX_SHAPE = Math.max(...RIDGES.flatMap((r) => r.shape))

/** Slots where `ridge` has data, in order. */
export const playedSlots = (ridge: Ridge) =>
  ridge.counts.flatMap((c, i) => (c === null ? [] : [i]))
