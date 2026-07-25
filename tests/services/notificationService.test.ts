import { beforeEach, describe, expect, it, vi } from "vitest";
import NotificationService from "../../services/notificationService";

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
    vi.spyOn(browser.permissions, "contains").mockImplementation(
      async () => false as never,
    );
    const createNotificationMock = vi.spyOn(browser.notifications, "create");

    await NotificationService.create("test", "Title", "Message");

    expect(createNotificationMock).not.toHaveBeenCalled();
  });

  it("creates a notification when permission is granted", async () => {
    vi.spyOn(browser.permissions, "contains").mockImplementation(
      async () => true as never,
    );
    const createNotificationMock = vi
      .spyOn(browser.notifications, "create")
      .mockImplementation(async () => "test" as never);

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
