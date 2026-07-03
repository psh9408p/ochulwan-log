const TITLES = [
  "모닝 생존자",
  "출근의 지배자",
  "지각 방어 성공",
  "커피 전사",
  "오늘의 대장",
];

export function pickTitle(seed: string): string {
  const total = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return TITLES[total % TITLES.length];
}
