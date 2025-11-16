import type { FlashCard } from "../data/cards";

/**
 * Number word mappings for flexible matching
 */
const numberWords: Record<string, string[]> = {
  "0": ["zero", "oh"],
  "1": ["one", "won"],
  "2": ["two", "to", "too"],
  "3": ["three", "tree"],
  "4": ["four", "for", "fore"],
  "5": ["five"],
  "6": ["six", "sicks"],
  "7": ["seven"],
  "8": ["eight", "ate"],
  "9": ["nine"],
  "10": ["ten"],
  "11": ["eleven"],
  "12": ["twelve"],
  "13": ["thirteen"],
  "14": ["fourteen"],
  "15": ["fifteen"],
  "16": ["sixteen"],
  "17": ["seventeen"],
  "18": ["eighteen"],
  "19": ["nineteen"],
  "20": ["twenty"],
};

/**
 * Letter pronunciation variations for flexible matching
 */
const letterVariations: Record<string, string[]> = {
  A: ["a", "ay", "aye"],
  B: ["b", "be", "bee"],
  C: ["c", "see", "sea"],
  D: ["d", "dee"],
  E: ["e", "ee"],
  F: ["f", "eff"],
  G: ["g", "gee"],
  H: ["h", "aitch"],
  I: ["i", "eye", "aye"],
  J: ["j", "jay"],
  K: ["k", "kay"],
  L: ["l", "ell"],
  M: ["m", "em"],
  N: ["n", "en"],
  O: ["o", "oh", "owe"],
  P: ["p", "pee"],
  Q: ["q", "cue", "queue"],
  R: ["r", "are", "arr"],
  S: ["s", "ess"],
  T: ["t", "tee", "tea"],
  U: ["u", "you"],
  V: ["v", "vee"],
  W: ["w", "double-u", "doubleyou"],
  X: ["x", "ex"],
  Y: ["y", "why"],
  Z: ["z", "zee", "zed"],
};

/**
 * Normalizes a string for comparison:
 * - Converts to lowercase
 * - Trims whitespace
 * - Removes punctuation
 * - Removes extra spaces
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove punctuation except hyphens
    .replace(/\s+/g, " "); // Normalize whitespace
}

/**
 * Validates if a transcribed answer matches the expected card answer.
 * Handles variations in pronunciation and spelling for both numbers and letters.
 *
 * @param transcription - The text transcribed from the user's speech
 * @param card - The flash card containing the expected answer
 * @returns true if the answer is correct, false otherwise
 */
export function validateAnswer(
  transcription: string,
  card: FlashCard
): boolean {
  const normalizedTranscription = normalize(transcription);

  // Handle empty transcription
  if (!normalizedTranscription) {
    return false;
  }

  // Get expected answers based on card type
  const expectedAnswers: string[] = [];

  if (card.type === "number") {
    // For numbers, accept the digit or any word variation
    expectedAnswers.push(normalize(card.display)); // e.g., "5"
    expectedAnswers.push(normalize(`number ${card.display}`)); // e.g., "number 5"

    const wordVariations = numberWords[card.display] || [];
    wordVariations.forEach((word) => {
      expectedAnswers.push(normalize(word)); // e.g., "five"
      expectedAnswers.push(normalize(`number ${word}`)); // e.g., "number five"
    });
  } else if (card.type === "letter") {
    const letter = card.display.toUpperCase();

    // Accept the letter itself
    expectedAnswers.push(normalize(card.display)); // e.g., "a"
    expectedAnswers.push(normalize(`letter ${card.display}`)); // e.g., "letter a"

    // Accept pronunciation variations
    const variations = letterVariations[letter] || [];
    variations.forEach((variation) => {
      expectedAnswers.push(normalize(variation)); // e.g., "ay"
      expectedAnswers.push(normalize(`letter ${variation}`)); // e.g., "letter ay"
    });
  }

  // Check if transcription matches any expected answer
  // Also check if the transcription contains the expected answer as a word
  for (const expected of expectedAnswers) {
    if (normalizedTranscription === expected) {
      return true;
    }

    // Check if the expected answer is a complete word in the transcription
    const wordBoundaryRegex = new RegExp(`\\b${expected}\\b`);
    if (wordBoundaryRegex.test(normalizedTranscription)) {
      return true;
    }
  }

  return false;
}

/**
 * Gets a hint about what was expected for the card
 */
export function getExpectedAnswer(card: FlashCard): string {
  if (card.type === "number") {
    const wordVariations = numberWords[card.display];
    if (wordVariations && wordVariations.length > 0) {
      return `"${card.display}" or "${wordVariations[0]}"`;
    }
    return `"${card.display}"`;
  } else {
    return `"${card.display}"`;
  }
}
