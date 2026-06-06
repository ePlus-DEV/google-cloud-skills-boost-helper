import { describe, expect, it } from "vitest";
import { addSolutionUtmParams } from "../../utils/trackingUrl";

describe("addSolutionUtmParams", () => {
  it("adds extension UTM params to solution URLs", () => {
    const result = addSolutionUtmParams("https://eplus.dev/lab-solution");

    expect(result).toBe(
      "https://eplus.dev/lab-solution?utm_source=google-cloud-skill-boost&utm_medium=extension",
    );
  });

  it("preserves existing query params and hash fragments", () => {
    const result = addSolutionUtmParams(
      "https://eplus.dev/lab-solution?t=123#step-2",
    );

    expect(result).toBe(
      "https://eplus.dev/lab-solution?t=123&utm_source=google-cloud-skill-boost&utm_medium=extension#step-2",
    );
  });

  it("normalizes relative solution URLs against eplus.dev", () => {
    const result = addSolutionUtmParams("/lab-solution");

    expect(result).toBe(
      "https://eplus.dev/lab-solution?utm_source=google-cloud-skill-boost&utm_medium=extension",
    );
  });

  it("rejects non-http protocols", () => {
    expect(addSolutionUtmParams("javascript:alert(1)")).toBeNull();
  });
});
