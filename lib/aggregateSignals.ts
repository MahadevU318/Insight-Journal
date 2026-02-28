import { StructuredSignals, AggregateSignals } from "./types";

export function aggregateLastThreeDays(
  entries: StructuredSignals[]
): AggregateSignals {
  const recent = entries.slice(-3);

  const avg = (arr: number[]) =>
    arr.reduce((a, b) => a + b, 0) / arr.length;

  const allThemes = recent.flatMap((e) => e.themes);

  const themeCount: Record<string, number> = {};

  allThemes.forEach((theme) => {
    themeCount[theme] = (themeCount[theme] || 0) + 1;
  });

  const dominant = Object.entries(themeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([theme]) => theme);

  return {
    avg_mood: avg(recent.map((e) => e.mood_score)),
    avg_stress: avg(recent.map((e) => e.stress_level)),
    avg_energy: avg(recent.map((e) => e.energy_level)),
    dominant_themes: dominant,
  };
}

export function aggregateLastSevenDays(
  entries: StructuredSignals[]
): AggregateSignals {
  const recent = entries.slice(-7);

  const avg = (arr: number[]) =>
    arr.reduce((a, b) => a + b, 0) / arr.length;

  const allThemes = recent.flatMap((e) => e.themes);

  const themeCount: Record<string, number> = {};

  allThemes.forEach((theme) => {
    themeCount[theme] = (themeCount[theme] || 0) + 1;
  });

  const dominant = Object.entries(themeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([theme]) => theme);

  return {
    avg_mood: avg(recent.map((e) => e.mood_score)),
    avg_stress: avg(recent.map((e) => e.stress_level)),
    avg_energy: avg(recent.map((e) => e.energy_level)),
    dominant_themes: dominant,
  };
}