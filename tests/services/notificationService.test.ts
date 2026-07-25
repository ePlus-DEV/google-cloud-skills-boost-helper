import { beforeEach, describe, expect, it, vi } from "vitest";
import NotificationService from "../../services/notificationService";

type PermissionMethod = (permissions: {
  permissions: readonly ["notifications"];
}) => Promise<boolean>;

const requestPermissionMock = vi.mocked(
  browser.permissions.request as unknown as PermissionMethod,
);
const containsPermissionMock = vi.mocked(
  browser.permissions.contains as unknown as PermissionMethod,
);

describe("NotificationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requests the optional notifications permission", async () => {
    requestPermissionMock.mockResolvedValue(true);

    await expect(NotificationService.requestPermission()).resolves.toBe(true);
    expect(browser.permissions.request).toHaveBeenCalledWith({
      permissions: ["notifications"],
    });
  });

  it("does not create a notification without permission", async () => {
    containsPermissionMock.mockResolvedValue(false);

    await NotificationService.create("test", "Title", "Message");

    expect(browser.notifications.create).not.toHaveBeenCalled();
  });

  it("creates a notification when permission is granted", async () => {
    containsPermissionMock.mockResolvedValue(true);

    await NotificationService.create("test", "Title", "Message");

    expect(browser.notifications.create).toHaveBeenCalledWith(
      "test",
      expect.objectContaining({
        type: "basic",
        title: "Title",
        message: "Message",
      }),
    );
  });
});
