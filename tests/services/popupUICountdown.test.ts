import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const remoteConfig = vi.hoisted(() => ({
  isInitialized: vi.fn(() => true),
  initialize: vi.fn(() => Promise.resolve()),
  getStringParam: vi.fn((_key: string, fallback: string) =>
    Promise.resolve(fallback),
  ),
  getBooleanParam: vi.fn(() => Promise.resolve(true)),
}));

vi.mock("wxt/browser", () => ({
  browser: { i18n: { getMessage: (key: string) => key } },
}));

vi.mock("../../services/firebaseService", () => ({
  default: remoteConfig,
}));

import PopupUIService from "../../services/popupUIService";

describe("PopupUIService countdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-30T00:00:00.000Z"));
    vi.clearAllMocks();
    remoteConfig.isInitialized.mockReturnValue(true);
    remoteConfig.getStringParam.mockImplementation((_key, fallback) =>
      Promise.resolve(fallback),
    );
    remoteConfig.getBooleanParam.mockResolvedValue(true);
    (
      PopupUIService as typeof PopupUIService & {
        _countdownIntervals: Map<string, number>;
      }
    )._countdownIntervals = new Map();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("hides only the disabled countdown without creating a timer", async () => {
    document.body.innerHTML =
      '<div id="disabled" class="countdown-instance" data-program="facilitator"></div>';
    remoteConfig.getBooleanParam.mockResolvedValue(false);

    await PopupUIService.startFacilitatorCountdown();

    expect(
      document.getElementById("disabled")?.classList.contains("hidden"),
    ).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("renders an active timer and updates its counters", async () => {
    document.body.innerHTML = [
      '<div id="active" class="countdown-instance" data-program="arcade">',
      '<span class="countdown-days"></span><span class="countdown-hours"></span>',
      '<span class="countdown-minutes"></span><span class="countdown-seconds"></span>',
      "</div>",
    ].join("");
    remoteConfig.getStringParam.mockResolvedValue("2026-10-30T00:00:03.000Z");

    await PopupUIService.startFacilitatorCountdown();

    const counter = document.querySelector(".countdown-seconds");
    expect(counter?.textContent).toBe("03");
    await vi.advanceTimersByTimeAsync(1000);
    expect(counter?.textContent).toBe("02");
    await vi.advanceTimersByTimeAsync(2000);
    expect(document.querySelector("#active")?.textContent).toContain(
      "arcadeDeadlinePassed",
    );
    expect(vi.getTimerCount()).toBe(0);
  });

  it("creates only one Arcade card after Facilitator expires", async () => {
    document.body.innerHTML = [
      '<section id="milestones-section"></section>',
      '<div id="countdown-container">',
      '<div id="facilitator" class="countdown-instance" data-program="facilitator">',
      '<span class="countdown-days"></span>',
      "</div></div>",
    ].join("");
    remoteConfig.getStringParam.mockImplementation((key) =>
      Promise.resolve(
        key.includes("arcade")
          ? "2026-12-31T00:00:00.000Z"
          : "2026-10-01T00:00:00.000Z",
      ),
    );

    await PopupUIService.startFacilitatorCountdown();
    await vi.advanceTimersByTimeAsync(0);

    expect(document.querySelector("#facilitator")?.textContent).toContain(
      "facilitatorDeadlinePassed",
    );
    expect(
      document.querySelectorAll('.countdown-instance[data-program="arcade"]'),
    ).toHaveLength(1);

    await PopupUIService.startFacilitatorCountdown();
    expect(
      document.querySelectorAll('.countdown-instance[data-program="arcade"]'),
    ).toHaveLength(1);
  });
});
