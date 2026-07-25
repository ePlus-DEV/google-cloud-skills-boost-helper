import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const requestPermissionMock = vi.fn<(permissions: unknown) => Promise<boolean>>();
const containsPermissionMock = vi.fn<(permissions: unknown) => Promise<boolean>>();
const createNotificationMock = vi.fn();
const getUrlMock = vi.fn((path: string) => `extension://${path}`);

let NotificationService: typeof import("../../services/notificationService").default;

beforeAll(async () => {
  vi.stubGlobal("browser", {
    permissions: {
      request: requestPermissionMock,
      contains: containsPermissionMock,
    },
    notifications: {
      create: createNotificationMock,
    },
    runtime: {
      getURL: getUrlMock,
    },
  });

  NotificationService = (await import("../../services/notificationService")).default;
});

describe("NotificationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requests the optional notifications permission", async () => {
    requestPermissionMock.mockResolvedValue(true);

    await expect(NotificationService.requestPermission()).resolves.toBe(true);
    expect(requestPermissionMock).toHaveBeenCalledWith({
      permissions: ["notifications"],
    });
  });

  it("does not create a notification without permission", async () => {
    containsPermissionMock.mockResolvedValue(false);

    await NotificationService.create("test", "Title", "Message");

    expect(createNotificationMock).not.toHaveBeenCalled();
  });

  it("creates a notification when permission is granted", async () => {
    containsPermissionMock.mockResolvedValue(true);

    await NotificationService.create("test", "Title", "Message");

    expect(createNotificationMock).toHaveBeenCalledWith(
      "test",
      expect.objectContaining({
        type: "basic",
        title: "Title",
        message: "Message",
      }),
    );
  });
});
