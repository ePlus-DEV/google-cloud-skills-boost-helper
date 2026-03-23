import { vi } from "vitest";

// Mock WXT storage global
const storageStore: Record<string, unknown> = {};

const storageMock = {
  getItem: vi.fn(async (key: string) => storageStore[key] ?? null),
  setItem: vi.fn(async (key: string, value: unknown) => {
    storageStore[key] = value;
  }),
  removeItem: vi.fn(async (key: string) => {
    delete storageStore[key];
  }),
  defineItem: vi.fn((key: string, opts?: { fallback?: unknown }) => ({
    getValue: vi.fn(async () => storageStore[key] ?? opts?.fallback ?? null),
    setValue: vi.fn(async (v: unknown) => {
      storageStore[key] = v;
    }),
  })),
};

// @ts-expect-error - global mock
global.storage = storageMock;

// Mock chrome runtime
// @ts-expect-error - global mock
global.chrome = {
  runtime: {
    sendMessage: vi.fn(),
    onMessage: { addListener: vi.fn() },
  },
  action: {
    setBadgeText: vi.fn(),
    setBadgeBackgroundColor: vi.fn(),
  },
};

// Reset storage between tests
beforeEach(() => {
  for (const key of Object.keys(storageStore)) {
    delete storageStore[key];
  }
  vi.clearAllMocks();
});
