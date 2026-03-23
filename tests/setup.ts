import { vi } from "vitest";

// Mock WXT storage global
const storageStore: Record<string, unknown> = {};

const storageMock = {
  getItem: vi.fn((key: string) => Promise.resolve(storageStore[key] ?? null)),
  setItem: vi.fn((key: string, value: unknown) => {
    storageStore[key] = value;
    return Promise.resolve();
  }),
  removeItem: vi.fn((key: string) => {
    delete storageStore[key];
    return Promise.resolve();
  }),
  defineItem: vi.fn((key: string, opts?: { fallback?: unknown }) => ({
    getValue: vi.fn(() =>
      Promise.resolve(storageStore[key] ?? opts?.fallback ?? null),
    ),
    setValue: vi.fn((v: unknown) => {
      storageStore[key] = v;
      return Promise.resolve();
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
