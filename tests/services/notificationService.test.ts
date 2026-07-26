import { beforeEach, describe, expect, it, vi } from "vitest";
import AccountService from "../../services/accountService";
import NotificationService from "../../services/notificationService";

function mockNotificationSetting(enableNotifications: boolean) {
  return vi.spyOn(AccountService, "getSettings").mockResolvedValue({
    enableSearchFeature: true,
    enableNotifications,
  });
}

describe("NotificationService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("requests the optional notifications permission", async () => {
    const requestPermissionMock = vi
      .spyOn(browser.permissions, "request")
      .mockImplementation(async () => true as never);

    await expect(NotificationService.requestPermission()).resolves.toBe(true);
    expect(requestPermissionMock).toHaveBeenCalledWith({
      permissions: ["notifications"],
    });
  });

  it("does not create a notification without permission", async () => {
    mockNotificationSetting(true);
    vi.spyOn(browser.permissions, "contains").mockImplementation(
      async () => false as never,
    );
    const createNotificationMock = vi.spyOn(browser.notifications, "create");

    await expect(
      NotificationService.create("test", "Title", "Message"),
    ).resolves.toBe(false);

    expect(createNotificationMock).not.toHaveBeenCalled();
  });

  it("does not create a notification when the setting is disabled", async () => {
    mockNotificationSetting(false);
    vi.spyOn(browser.permissions, "contains").mockImplementation(
      async () => true as never,
    );
    const createNotificationMock = vi.spyOn(browser.notifications, "create");

    await expect(
      NotificationService.create("test", "Title", "Message"),
    ).resolves.toBe(false);

    expect(createNotificationMock).not.toHaveBeenCalled();
  });

  it("creates a notification when enabled and permission is granted", async () => {
    mockNotificationSetting(true);
    vi.spyOn(browser.permissions, "contains").mockImplementation(
      async () => true as never,
    );
    const createNotificationMock = vi
      .spyOn(browser.notifications, "create")
      .mockImplementation(async () => "test" as never);

    await expect(
      NotificationService.create("test", "Title", "Message"),
    ).resolves.toBe(true);

    expect(createNotificationMock).toHaveBeenCalledWith(
      "test",
      expect.objectContaining({
        type: "basic",
        title: "Title",
        message: "Message",
      }),
    );
  });

  it("returns false instead of rejecting when notification creation fails", async () => {
    mockNotificationSetting(true);
    vi.spyOn(browser.permissions, "contains").mockImplementation(
      async () => true as never,
    );
    vi.spyOn(browser.notifications, "create").mockImplementation(async () => {
      throw new Error("creation failed");
    });

    await expect(
      NotificationService.create("test", "Title", "Message"),
    ).resolves.toBe(false);
  });
});
