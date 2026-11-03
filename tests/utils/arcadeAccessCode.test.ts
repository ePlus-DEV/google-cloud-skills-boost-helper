import { describe, expect, it, vi } from "vitest";
import {
  arcadeGameIdFromUrl,
  codeFromUrlFragment,
  fillAccessCodeInput,
  findAccessCodeInput,
  findCrawlerGameCode,
} from "../../utils/arcadeAccessCode";

const game = {
  title: "Arcade Base Camp November 2026",
  accessCode: "1q-basecamp-02108",
  joinUrl: "https://www.skills.google/games/7564?utm_source=hoangsvit",
  status: "active",
  reconstructed: false,
  deadline: "2026-11-24T18:29:50.000Z",
};
const NOW = Date.parse("2026-11-03T00:00:00.000Z");

describe("exact Arcade game crawler mapping", () => {
  it("matches the current Base Camp game 7564 and its public crawler access code", () => {
    expect(findCrawlerGameCode([game], "7564", NOW)).toMatchObject({
      gameId: "7564",
      code: "1q-basecamp-02108",
      title: "Arcade Base Camp November 2026",
    });
  });

  it("never matches a different ID, a partial ID, lab URLs, or spoofed hosts", () => {
    expect(findCrawlerGameCode([game], "756", NOW)).toBeNull();
    expect(findCrawlerGameCode([game], "7565", NOW)).toBeNull();
    expect(arcadeGameIdFromUrl("https://www.skills.google/games/7564/labs/123")).toBeNull();
    expect(arcadeGameIdFromUrl("https://www.skills.google.evil.test/games/7564")).toBeNull();
    expect(arcadeGameIdFromUrl("http://www.skills.google/games/7564")).toBeNull();
    expect(arcadeGameIdFromUrl(game.joinUrl)).toBe("7564");
    expect(arcadeGameIdFromUrl("https://skills.google/games/7564/")).toBe("7564");
  });

  it("rejects expired, inactive, reconstructed, missing, and conflicting codes", () => {
    expect(findCrawlerGameCode([game], "7564", Date.parse("2026-11-25T00:00:00Z"))).toBeNull();
    expect(findCrawlerGameCode([{ ...game, status: "expired" }], "7564", NOW)).toBeNull();
    expect(findCrawlerGameCode([{ ...game, reconstructed: true }], "7564", NOW)).toBeNull();
    expect(findCrawlerGameCode([{ ...game, accessCode: "" }], "7564", NOW)).toBeNull();
    expect(findCrawlerGameCode([{ ...game, accessCode: "bad code <script>" }], "7564", NOW)).toBeNull();
    expect(findCrawlerGameCode([game, { ...game, accessCode: "different-code-2" }], "7564", NOW)).toBeNull();
  });
});

describe("explicit code fragments", () => {
  it("accepts safe user-provided hashes but never assumes standard query support", () => {
    expect(codeFromUrlFragment("#access_code=1q-basecamp-02108")).toBe("1q-basecamp-02108");
    expect(codeFromUrlFragment("#access_code=unsafe%20value")).toBeNull();
    expect(codeFromUrlFragment("#other=x")).toBeNull();
  });
});

describe("Google Shadow DOM access-code field", () => {
  it("finds nested md-outlined-field input and dispatches composed events", () => {
    const host = document.createElement("md-outlined-field");
    document.body.append(host);
    const shadow = host.attachShadow({ mode: "open" });
    const nested = document.createElement("section");
    shadow.append(nested);
    const child = nested.attachShadow({ mode: "open" });
    const input = document.createElement("input");
    input.name = "access_code";
    child.append(input);

    const inputSpy = vi.fn();
    const changeSpy = vi.fn();
    document.addEventListener("input", inputSpy);
    document.addEventListener("change", changeSpy);
    expect(findAccessCodeInput(document)).toBe(input);
    expect(fillAccessCodeInput(input, game.accessCode)).toBe(true);
    expect(input.value).toBe(game.accessCode);
    expect(inputSpy).toHaveBeenCalledTimes(1);
    expect(changeSpy).toHaveBeenCalledTimes(1);

    document.removeEventListener("input", inputSpy);
    document.removeEventListener("change", changeSpy);
    host.remove();
  });

  it("refuses a disabled field, invalid code and does not submit any form", () => {
    const form = document.createElement("form");
    const input = document.createElement("input");
    input.name = "access_code";
    form.append(input);
    document.body.append(form);
    const submit = vi.fn();
    form.addEventListener("submit", submit);
    input.disabled = true;
    expect(fillAccessCodeInput(input, game.accessCode)).toBe(false);
    input.disabled = false;
    expect(fillAccessCodeInput(input, "bad code")).toBe(false);
    expect(submit).not.toHaveBeenCalled();
    form.remove();
  });
});
