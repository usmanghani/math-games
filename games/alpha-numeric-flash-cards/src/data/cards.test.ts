import { cardsForMode, letterCards, numberCards } from "./cards";

describe("cards data", () => {
  it("includes 10 number cards (0 - 9)", () => {
    expect(numberCards).toHaveLength(10);
    expect(numberCards[0].display).toBe("0");
    expect(numberCards.at(-1)?.display).toBe("9");
  });

  it("includes 26 letter cards", () => {
    expect(letterCards).toHaveLength(26);
    expect(letterCards[0].display).toBe("A");
    expect(letterCards.at(-1)?.display).toBe("Z");
  });

  it("returns combined deck for mixed mode", () => {
    expect(cardsForMode("mixed")).toHaveLength(
      letterCards.length + numberCards.length,
    );
  });
});
