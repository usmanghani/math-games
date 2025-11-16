export type CardType = "number" | "letter";

export type CardMode = "numbers" | "letters" | "mixed";

export interface FlashCard {
  id: string;
  type: CardType;
  display: string;
  label: string;
  hint: string;
  color: string;
}

const numberWords = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
  "twenty",
];

const numberCardPalette = [
  "#ffd87d",
  "#ffc1a1",
  "#a8e0ff",
  "#c4f5d1",
  "#ff9fb5",
  "#e4d5ff",
];

export const numberCards: FlashCard[] = numberWords.map((word, value) => ({
  id: `number-${value}`,
  type: "number",
  display: value.toString(),
  label: `Number ${value}`,
  hint: `Sounds like “${word}”`,
  color: numberCardPalette[value % numberCardPalette.length],
}));

const letterPalette = [
  "#ffb8d2",
  "#ffd87d",
  "#9de7ff",
  "#c3ffd0",
  "#f2c0ff",
  "#ffb084",
];

const phonetics: Record<string, string> = {
  A: "ay",
  B: "bee",
  C: "see",
  D: "dee",
  E: "ee",
  F: "ef",
  G: "jee",
  H: "aych",
  I: "eye",
  J: "jay",
  K: "kay",
  L: "el",
  M: "em",
  N: "en",
  O: "oh",
  P: "pee",
  Q: "cue",
  R: "ar",
  S: "ess",
  T: "tee",
  U: "you",
  V: "vee",
  W: "double-you",
  X: "ex",
  Y: "why",
  Z: "zee",
};

export const letterCards: FlashCard[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  .split("")
  .map((char, index) => ({
    id: `letter-${char}`,
    type: "letter",
    display: char,
    label: `Letter ${char}`,
    hint: `Sounds like “${phonetics[char]}”`,
    color: letterPalette[index % letterPalette.length],
  }));

export function cardsForMode(mode: CardMode): FlashCard[] {
  if (mode === "numbers") return numberCards;
  if (mode === "letters") return letterCards;
  return [...numberCards, ...letterCards];
}
