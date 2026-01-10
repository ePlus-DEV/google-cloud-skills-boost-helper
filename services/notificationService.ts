/**
 * Service để quản lý browser notifications
 * Supports Chrome, Firefox, Edge, and other browsers
 */

export interface NotificationOptions {
  title: string;
  message: string;
  iconUrl?: string;
  type?: "basic" | "image" | "list" | "progress";
  priority?: number;
  requireInteraction?: boolean;
  silent?: boolean;
  buttons?: Array<{ title: string }>;
  contextMessage?: string;
}

class NotificationService {
  private notificationCallbacks: Map<string, (buttonIndex?: number) => void> =
    new Map();

  /**
   * Kiểm tra xem browser có hỗ trợ notifications không
   */
  isSupported(): boolean {
    return (
      typeof browser !== "undefined" && browser.notifications !== undefined
    );
  }

  /**
   * Request permission để hiển thị notifications
   * @returns Promise<boolean> true nếu được cho phép
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn("Notifications are not supported in this browser");
      return false;
    }

    // Chrome extensions có quyền tự động nếu đã khai báo trong manifest
    return true;
  }

  /**
   * Hiển thị notification
   * @param options Notification options
   * @param onClick Callback khi click vào notification
   * @param onButtonClick Callback khi click vào button
   * @returns Promise<string> notification ID
   */
  async show(
    options: NotificationOptions,
    onClick?: () => void,
    onButtonClick?: (buttonIndex: number) => void
  ): Promise<string> {
    if (!this.isSupported()) {
      console.warn("Notifications are not supported in this browser");
      throw new Error("Notifications are not supported");
    }

    const notificationId = `notification_${Date.now()}`;

    // Tạo notification options cho browser API
    const browserNotificationOptions: browser.notifications.CreateNotificationOptions =
      {
        type: (options.type || "basic") as "basic",
        iconUrl: options.iconUrl || browser.runtime.getURL("icon/128.png"),
        title: options.title,
        message: options.message,
        priority: options.priority,
        requireInteraction: options.requireInteraction,
        silent: options.silent,
      };

    // Add buttons nếu có
    if (options.buttons && options.buttons.length > 0) {
      browserNotificationOptions.buttons = options.buttons;
    }

    // Add context message nếu có
    if (options.contextMessage) {
      browserNotificationOptions.contextMessage = options.contextMessage;
    }

    try {
      // Tạo notification
      await browser.notifications.create(
        notificationId,
        browserNotificationOptions
      );

      // Lưu callback để xử lý sau
      if (onClick || onButtonClick) {
        this.notificationCallbacks.set(notificationId, (buttonIndex) => {
          if (buttonIndex !== undefined && onButtonClick) {
            onButtonClick(buttonIndex);
          } else if (onClick) {
            onClick();
          }
        });
      }

      return notificationId;
    } catch (error) {
      console.error("Failed to create notification:", error);
      throw error;
    }
  }

  /**
   * Clear một notification cụ thể
   * @param notificationId ID của notification cần clear
   */
  async clear(notificationId: string): Promise<void> {
    if (!this.isSupported()) {
      return;
    }

    try {
      await browser.notifications.clear(notificationId);
      this.notificationCallbacks.delete(notificationId);
    } catch (error) {
      console.error("Failed to clear notification:", error);
    }
  }

  /**
   * Clear tất cả notifications
   */
  async clearAll(): Promise<void> {
    if (!this.isSupported()) {
      return;
    }

    try {
      const notifications = await browser.notifications.getAll();
      const notificationIds = Object.keys(notifications);

      await Promise.all(notificationIds.map((id) => this.clear(id)));
    } catch (error) {
      console.error("Failed to clear all notifications:", error);
    }
  }

  /**
   * Setup notification event listeners
   * Phải được gọi trong background script
   */
  setupListeners(): void {
    if (!this.isSupported()) {
      return;
    }

    // Listener khi click vào notification
    browser.notifications.onClicked.addListener((notificationId) => {
      const callback = this.notificationCallbacks.get(notificationId);
      if (callback) {
        callback();
      }
      // Auto clear notification sau khi click
      this.clear(notificationId);
    });

    // Listener khi click vào button trong notification
    browser.notifications.onButtonClicked.addListener(
      (notificationId, buttonIndex) => {
        const callback = this.notificationCallbacks.get(notificationId);
        if (callback) {
          callback(buttonIndex);
        }
        // Auto clear notification sau khi click button
        this.clear(notificationId);
      }
    );

    // Listener khi notification bị close
    browser.notifications.onClosed.addListener((notificationId) => {
      this.notificationCallbacks.delete(notificationId);
    });
  }

  /**
   * Hiển thị notification đơn giản với title và message
   * @param title Tiêu đề notification
   * @param message Nội dung notification
   * @returns Promise<string> notification ID
   */
  async showSimple(title: string, message: string): Promise<string> {
    return this.show({ title, message });
  }

  /**
   * Hiển thị notification với action buttons
   * @param title Tiêu đề notification
   * @param message Nội dung notification
   * @param buttons Array các button
   * @param onButtonClick Callback khi click button
   * @returns Promise<string> notification ID
   */
  async showWithActions(
    title: string,
    message: string,
    buttons: Array<{ title: string }>,
    onButtonClick: (buttonIndex: number) => void
  ): Promise<string> {
    return this.show(
      {
        title,
        message,
        buttons,
        requireInteraction: true, // Không tự động đóng
      },
      undefined,
      onButtonClick
    );
  }

  /**
   * Hiển thị notification quan trọng (require interaction)
   * @param title Tiêu đề notification
   * @param message Nội dung notification
   * @param onClick Callback khi click
   * @returns Promise<string> notification ID
   */
  async showImportant(
    title: string,
    message: string,
    onClick?: () => void
  ): Promise<string> {
    return this.show(
      {
        title,
        message,
        requireInteraction: true,
        priority: 2, // Highest priority
      },
      onClick
    );
  }

  /**
   * Hiển thị notification với image
   * @param title Tiêu đề notification
   * @param message Nội dung notification
   * @param imageUrl URL của image
   * @returns Promise<string> notification ID
   */
  async showWithImage(
    title: string,
    message: string,
    imageUrl: string
  ): Promise<string> {
    return this.show({
      title,
      message,
      type: "image",
      iconUrl: imageUrl,
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
