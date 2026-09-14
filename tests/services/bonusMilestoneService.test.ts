import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Account, ArcadeData } from "../../types";

const mocks = vi.hoisted(() => ({
  memory: new Map<string, unknown>(),
  getActiveAccount: vi.fn(),
  getAllAccounts: vi.fn(),
  getItem: vi.fn(),
  setItem: vi.fn(),
  watch: vi.fn(),
}));

vi.mock("wxt/utils/storage", () => ({
  storage: {
    getItem: mocks.getItem,
    setItem: mocks.setItem,
    watch: mocks.watch,
  },
}));

vi.mock("../../services/accountService", () => ({
  default: {
    getActiveAccount: mocks.getActiveAccount,
    getAllAccounts: mocks.getAllAccounts,
  },
}));

import {
  DEFAULT_BONUS_MILESTONE_POINTS,
  getBonusMilestoneAvailablePoints,
  getBonusMilestoneControlState,
  isBonusMilestoneCompleted,
  setActiveBonusMilestoneCompleted,
} from "../../services/bonusMilestoneService";

const PROFILE_URL =
  "https://www.skills.google/public_profiles/11111111-1111-4111-8111-111111111111";

type FacilitatorOverrides = Partial<NonNullable<ArcadeData["facilitator"]>>;

/** Build Arcade metadata for a test Facilitator period with optional overrides. */
function makeArcadeData(
  facilitatorOverrides: FacilitatorOverrides = {},
): ArcadeData {
  return {
    facilitator: {
      startsAt: "2026-01-01T00:00:00Z",
      endsAt: "2026-12-31T23:59:59Z",
      bonusMilestoneEnabled: true,
      bonusMilestoneAvailablePoints: 10,
      bonusMilestoneCompleted: false,
      bonusMilestonePoints: 0,
      milestoneBonusPoints: 5,
      ...facilitatorOverrides,
    },
  };
}

/** Build one active account around the supplied Arcade response. */
function makeAccount(
  arcadeData: ArcadeData,
  facilitatorProgram = true,
): Account {
  return {
    id: "account-1",
    name: "Test Account",
    profileUrl: PROFILE_URL,
    arcadeData,
    facilitatorProgram,
    createdAt: "2026-01-01T00:00:00Z",
    lastUsed: "2026-09-14T00:00:00Z",
  };
}

/** Point the mocked account service at the supplied account. */
function useAccount(account: Account): void {
  mocks.getActiveAccount.mockImplementation(() => Promise.resolve(account));
  mocks.getAllAccounts.mockImplementation(() => Promise.resolve([account]));
}

beforeEach(() => {
  mocks.memory.clear();
  mocks.getActiveAccount.mockReset();
  mocks.getAllAccounts.mockReset();
  mocks.getItem.mockReset();
  mocks.setItem.mockReset();
  mocks.watch.mockReset();

  mocks.getItem.mockImplementation((key: string) =>
    Promise.resolve(mocks.memory.get(key)),
  );
  mocks.setItem.mockImplementation((key: string, value: unknown) => {
    mocks.memory.set(key, value);
    return Promise.resolve();
  });
  mocks.watch.mockReturnValue(() => undefined);
});

describe("Bonus Milestone season safety", () => {
  it("uses the Hub-provided available point amount instead of hardcoding +10", () => {
    expect(
      getBonusMilestoneAvailablePoints(
        makeArcadeData({ bonusMilestoneAvailablePoints: 12 }),
      ),
    ).toBe(12);
  });

  it("keeps +10 only as a compatibility fallback when old metadata omits the amount", () => {
    expect(getBonusMilestoneAvailablePoints({ facilitator: {} })).toBe(
      DEFAULT_BONUS_MILESTONE_POINTS,
    );
  });

  it("does not reuse a confirmation when the same profile moves to a new period", async () => {
    const account = makeAccount(makeArcadeData());
    useAccount(account);

    await setActiveBonusMilestoneCompleted(true);
    expect((await getBonusMilestoneControlState()).completed).toBe(true);
    expect(mocks.memory.size).toBe(1);

    account.arcadeData = makeArcadeData({
      startsAt: "2027-01-01T00:00:00Z",
      endsAt: "2027-06-30T23:59:59Z",
    });

    const nextPeriod = await getBonusMilestoneControlState();
    expect(nextPeriod.completed).toBe(false);
    expect(await isBonusMilestoneCompleted(PROFILE_URL)).toBe(false);
  });

  it("disables claiming completely when a later season has no Bonus Milestone", async () => {
    const account = makeAccount(
      makeArcadeData({
        startsAt: "2027-07-01T00:00:00Z",
        endsAt: "2027-12-31T23:59:59Z",
        bonusMilestoneEnabled: false,
        bonusMilestoneAvailablePoints: 0,
        bonusMilestoneCompleted: true,
        bonusMilestonePoints: 10,
        milestoneBonusPoints: 25,
      }),
    );
    useAccount(account);

    const state = await getBonusMilestoneControlState();
    expect(state.enabled).toBe(false);
    expect(state.points).toBe(0);
    expect(state.completed).toBe(false);
    expect(state.appliedPoints).toBe(0);
    expect(state.milestoneBonusPoints).toBe(25);
    expect(await isBonusMilestoneCompleted(PROFILE_URL)).toBe(false);

    await setActiveBonusMilestoneCompleted(true);
    expect(mocks.setItem).not.toHaveBeenCalled();
    expect(mocks.memory.size).toBe(0);
  });

  it("treats zero available points as no claimable bonus even if enabled is true", async () => {
    const account = makeAccount(
      makeArcadeData({
        bonusMilestoneEnabled: true,
        bonusMilestoneAvailablePoints: 0,
        bonusMilestoneCompleted: true,
        bonusMilestonePoints: 0,
      }),
    );
    useAccount(account);

    const state = await getBonusMilestoneControlState();
    expect(state.enabled).toBe(true);
    expect(state.points).toBe(0);
    expect(state.completed).toBe(false);
    expect(await isBonusMilestoneCompleted(PROFILE_URL)).toBe(false);
  });

  it("ignores confirmation when Facilitator participation is disabled", async () => {
    const account = makeAccount(makeArcadeData(), false);
    useAccount(account);

    await setActiveBonusMilestoneCompleted(true);
    expect(await isBonusMilestoneCompleted(PROFILE_URL)).toBe(false);
    expect(mocks.setItem).not.toHaveBeenCalled();
  });
});
