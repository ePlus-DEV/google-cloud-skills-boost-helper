/**
 * Example: Monitor service để check và gửi notifications định kỳ
 * Đặt file này trong services/ và import vào background.ts nếu cần
 */

import { notificationService } from "./notificationService";
import StorageService from "./storageService";
import { calculateFacilitatorBonus } from "./facilitatorService";

export interface NotificationConfig {
  enableMilestoneNotifications: boolean;
  enableDeadlineNotifications: boolean;
  enableUpdateNotifications: boolean;
  milestones: number[];
  deadlineWarningDays: number[];
}

class MonitorService {
  private config: NotificationConfig = {
    enableMilestoneNotifications: true,
    enableDeadlineNotifications: true,
    enableUpdateNotifications: true,
    milestones: [100, 500, 1000, 2000, 5000, 10000],
    deadlineWarningDays: [30, 14, 7, 3, 1],
  };

  private checkInterval: number | null = null;

  /**
   * Khởi tạo monitoring service
   */
  async initialize(config?: Partial<NotificationConfig>): Promise<void> {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Load config từ storage nếu có
    const savedConfig = await browser.storage.local.get("notificationConfig");
    if (savedConfig.notificationConfig) {
      this.config = { ...this.config, ...savedConfig.notificationConfig };
    }

    // Bắt đầu monitoring
    this.startMonitoring();
  }

  /**
   * Lưu config
   */
  async saveConfig(config: Partial<NotificationConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
    await browser.storage.local.set({
      notificationConfig: this.config,
    });
  }

  /**
   * Bắt đầu monitoring
   */
  startMonitoring(): void {
    if (this.checkInterval) {
      return; // Đã chạy rồi
    }

    // Check ngay lập tức
    this.performChecks();

    // Check mỗi 1 giờ
    this.checkInterval = window.setInterval(() => {
      this.performChecks();
    }, 60 * 60 * 1000);
  }

  /**
   * Dừng monitoring
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Thực hiện tất cả các checks
   */
  private async performChecks(): Promise<void> {
    try {
      await Promise.all([
        this.checkMilestones(),
        this.checkDeadlines(),
        this.checkDailyProgress(),
      ]);
    } catch (error) {
      console.error("Error performing notification checks:", error);
    }
  }

  /**
   * Check và notify milestones
   */
  private async checkMilestones(): Promise<void> {
    if (!this.config.enableMilestoneNotifications) {
      return;
    }

    try {
      const arcadeData = await StorageService.getArcadeData();
      if (!arcadeData) {
        return;
      }

      const totalPoints =
        (arcadeData.arcadePoints?.totalPoints || 0) +
        (arcadeData.faciCounts
          ? calculateFacilitatorBonus(arcadeData.faciCounts)
          : 0);

      // Lấy milestones đã notify
      const notifiedMilestones =
        (await browser.storage.local.get("notifiedMilestones"))
          .notifiedMilestones || [];

      // Check từng milestone
      for (const milestone of this.config.milestones) {
        if (
          totalPoints >= milestone &&
          !notifiedMilestones.includes(milestone)
        ) {
          await notificationService.showImportant(
            "🎉 Milestone Achievement!",
            `Congratulations! You've reached ${milestone} points in Google Cloud Skills Boost!`,
            () => {
              browser.tabs.create({
                url: "https://go.cloudskillsboost.google/arcade",
              });
            }
          );

          // Đánh dấu đã notify
          notifiedMilestones.push(milestone);
          await browser.storage.local.set({ notifiedMilestones });
        }
      }
    } catch (error) {
      console.error("Error checking milestones:", error);
    }
  }

  /**
   * Check và notify deadlines
   */
  private async checkDeadlines(): Promise<void> {
    if (!this.config.enableDeadlineNotifications) {
      return;
    }

    try {
      // Lấy deadline từ Firebase Remote Config hoặc storage
      const deadlineStr = await this.getDeadline();
      if (!deadlineStr) {
        return;
      }

      const deadline = new Date(deadlineStr);
      const now = new Date();
      const daysLeft = Math.floor(
        (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Check xem có trong danh sách warning days không
      if (this.config.deadlineWarningDays.includes(daysLeft)) {
        // Lấy danh sách đã notify cho ngày này
        const notifiedDeadlines =
          (await browser.storage.local.get("notifiedDeadlines"))
            .notifiedDeadlines || [];
        const notifyKey = `deadline_${daysLeft}_${
          deadline.toISOString().split("T")[0]
        }`;

        if (!notifiedDeadlines.includes(notifyKey)) {
          const daysText = daysLeft === 1 ? "1 day" : `${daysLeft} days`;

          await notificationService.showWithActions(
            "⏰ Deadline Warning",
            `Only ${daysText} left to complete Google Cloud Arcade Season!`,
            [{ title: "View Progress" }, { title: "Remind Me Later" }],
            (buttonIndex) => {
              if (buttonIndex === 0) {
                browser.tabs.create({
                  url: browser.runtime.getURL("/popup.html"),
                });
              }
            }
          );

          // Đánh dấu đã notify
          notifiedDeadlines.push(notifyKey);
          await browser.storage.local.set({ notifiedDeadlines });
        }
      }
    } catch (error) {
      console.error("Error checking deadlines:", error);
    }
  }

  /**
   * Check daily progress và encourage user
   */
  private async checkDailyProgress(): Promise<void> {
    try {
      const today = new Date().toISOString().split("T")[0];
      const lastCheck =
        (await browser.storage.local.get("lastProgressCheck"))
          .lastProgressCheck || "";

      if (lastCheck === today) {
        return; // Đã check hôm nay rồi
      }

      const arcadeData = await StorageService.getArcadeData();
      if (!arcadeData) {
        return;
      }

      // Lấy điểm hôm qua
      const yesterdayPoints =
        (await browser.storage.local.get("yesterdayPoints")).yesterdayPoints ||
        0;
      const todayPoints =
        (arcadeData.arcadePoints?.totalPoints || 0) +
        (arcadeData.faciCounts
          ? calculateFacilitatorBonus(arcadeData.faciCounts)
          : 0);

      const pointsGained = todayPoints - yesterdayPoints;

      // Nếu chưa có tiến độ hôm nay, encourage
      if (pointsGained === 0 && new Date().getHours() >= 18) {
        // Sau 6pm
        await notificationService.showSimple(
          "💪 Daily Reminder",
          "Don't forget to complete at least one lab today!"
        );
      } else if (pointsGained > 0) {
        // Có tiến độ, congratulate
        await notificationService.showSimple(
          "✨ Great Progress!",
          `You've earned ${pointsGained} points today. Keep it up!`
        );
      }

      // Cập nhật last check và yesterday points
      await browser.storage.local.set({
        lastProgressCheck: today,
        yesterdayPoints: todayPoints,
      });
    } catch (error) {
      console.error("Error checking daily progress:", error);
    }
  }

  /**
   * Lấy deadline từ Remote Config hoặc default
   */
  private async getDeadline(): Promise<string | null> {
    try {
      // Thử lấy từ Remote Config trước
      const { firebaseService } = await import("./firebaseService");
      const deadline = firebaseService.getString("countdown_deadline_arcade");
      if (deadline) {
        return deadline;
      }

      // Fallback: tính deadline tự động
      return this.calculateDefaultDeadline();
    } catch (error) {
      return this.calculateDefaultDeadline();
    }
  }

  /**
   * Tính default deadline (end of current season)
   */
  private calculateDefaultDeadline(): string {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (currentMonth <= 6) {
      return `${currentYear}-06-30T23:59:59+05:30`;
    }
    return `${currentYear}-12-31T23:59:59+05:30`;
  }

  /**
   * Gửi custom notification
   */
  async sendCustomNotification(
    title: string,
    message: string,
    actionUrl?: string
  ): Promise<void> {
    await notificationService.show(
      {
        title,
        message,
        requireInteraction: false,
      },
      actionUrl
        ? () => {
            browser.tabs.create({ url: actionUrl });
          }
        : undefined
    );
  }

  /**
   * Test notifications (for debugging)
   */
  async testNotifications(): Promise<void> {
    console.log("Testing notifications...");

    // Test 1: Simple notification
    await notificationService.showSimple(
      "Test Notification",
      "This is a test notification from Google Cloud Skills Boost Helper"
    );

    // Test 2: Notification with action
    setTimeout(async () => {
      await notificationService.showWithActions(
        "Test with Actions",
        "Click a button to test actions",
        [{ title: "Button 1" }, { title: "Button 2" }],
        (buttonIndex) => {
          console.log(`Test: Button ${buttonIndex} clicked`);
        }
      );
    }, 3000);

    // Test 3: Important notification
    setTimeout(async () => {
      await notificationService.showImportant(
        "Important Test",
        "This is an important test notification",
        () => {
          console.log("Test: Important notification clicked");
        }
      );
    }, 6000);
  }
}

// Export singleton instance
export const monitorService = new MonitorService();

// Export để dùng trong background.ts:
// import { monitorService } from "../services/monitorService";
// monitorService.initialize();
