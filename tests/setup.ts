import { vi, beforeEach } from "vitest";

// Mock WXT storage global
const storageStore: Record<string, unknown> = {};

const storageMock = {
  getItem: vi.fn((key: string) => Promise.resolve(storageStore[key] ?? null)),
  setItem: vi.fn((key: string, value: unknown) => {
    storageStore[key] = value;
    return Promise.resolve();
  }),
  removeItem: vi.fn((key: string) => {
    storageStore[key] = undefined;
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

(globalThis as unknown as Record<string, unknown>).storage = storageMock;

// Mock chrome runtime with enough shape to satisfy TS
const makeEvent = () => ({
  addListener: vi.fn(),
  removeListener: vi.fn(),
  hasListener: vi.fn(),
  hasListeners: vi.fn(),
  addRules: vi.fn(),
  removeRules: vi.fn(),
  getRules: vi.fn(),
});

(globalThis as unknown as Record<string, unknown>).chrome = {
  runtime: {
    sendMessage: vi.fn(),
    onMessage: makeEvent(),
  },
  action: {
    setBadgeText: vi.fn(),
    setBadgeBackgroundColor: vi.fn(),
    getBadgeText: vi.fn(),
    getBadgeBackgroundColor: vi.fn(),
    setBadgeTextColor: vi.fn(),
    getBadgeTextColor: vi.fn(),
    setTitle: vi.fn(),
    getTitle: vi.fn(),
    setIcon: vi.fn(),
    setPopup: vi.fn(),
    getPopup: vi.fn(),
    enable: vi.fn(),
    disable: vi.fn(),
    getUserSettings: vi.fn(),
    openPopup: vi.fn(),
    onClicked: makeEvent(),
  },
};

// Reset storage between tests
beforeEach(() => {
  for (const key of Object.keys(storageStore)) {
    storageStore[key] = undefined;
  }
  vi.clearAllMocks();
});
