import { clampMs, formatDuration } from "./duration";

describe("formatDuration", () => {
  it("formats short durations in seconds", () => {
    expect(formatDuration(0)).toBe("0.0s");
    expect(formatDuration(1500)).toBe("1.5s");
  });

  it("formats minute+ durations as m:ss.s", () => {
    expect(formatDuration(65000)).toBe("1:05.0");
  });

  it("handles invalid input", () => {
    expect(formatDuration(Number.NaN)).toBe("0.0s");
    expect(formatDuration(-200)).toBe("0.0s");
  });
});

describe("clampMs", () => {
  it("clamps values to the provided max", () => {
    expect(clampMs(500, 1000)).toBe(500);
    expect(clampMs(4000, 1000)).toBe(1000);
  });

  it("returns zero for invalid values", () => {
    expect(clampMs(-100, 500)).toBe(0);
    expect(clampMs(Number.POSITIVE_INFINITY, 500)).toBe(0);
  });
});
