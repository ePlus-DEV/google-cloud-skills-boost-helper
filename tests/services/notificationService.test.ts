import { beforeEach, describe, expect, it, vi } from "vitest";
import NotificationService from "../../services/notificationService";

describe("NotificationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requests the optional notifications permission", async () => {
    vi.mocked(browser.permissions.request).mockResolvedValue(true);

    await expect(NotificationService.requestPermission()).resolves.toBe(true);
    expect(browser.permissions.request).toHaveBeenCalledWith({
      permissions: ["notifications"],
    });
  });

  it("does not create a notification without permission", async () => {
    vi.mocked(browser.permissions.contains).mockResolvedValue(false);

    await NotificationService.create("test", "Title", "Message");

    expect(browser.notifications.create).not.toHaveBeenCalled();
  });

  it("creates a notification when permission is granted", async () => {
    vi.mocked(browser.permissions.contains).mockResolvedValue(true);

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
