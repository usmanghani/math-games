import { shuffle } from "../shuffle";

describe("shuffle", () => {
  it("returns a new array with the same items", () => {
    const source = [1, 2, 3, 4];
    const result = shuffle(source, 42);
    expect(result).toHaveLength(source.length);
    expect(result.sort()).toEqual([...source].sort());
  });

  it("is deterministic when seed is identical", () => {
    const first = shuffle(["a", "b", "c", "d", "e"], 123);
    const second = shuffle(["a", "b", "c", "d", "e"], 123);
    expect(first).toEqual(second);
  });
});
