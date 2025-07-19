/**
 * CSV Export Service
 * Xuất dữ liệu badges và arcade points ra file CSV
 */

import type { BadgeData } from "../types";

export interface ArcadePoints {
  totalPoints: number;
  gamePoints: number;
  triviaPoints: number;
  skillPoints: number;
  specialPoints: number;
}

export interface CSVBadgeData {
  badgeName: string;
  category: string;
  arcadePoints: number;
  earnedDate: string;
  imageUrl?: string;
}

export class CSVExportService {
  /**
   * Chuyển đổi BadgeData thành CSV format
   */
  static convertBadgesToCSV(badges: BadgeData[]): CSVBadgeData[] {
    return badges.map((badge) => ({
      badgeName: badge.title,
      category: this.getBadgeCategory(badge.title),
      arcadePoints: badge.points,
      earnedDate: badge.dateEarned || "",
      imageUrl: badge.imageURL || "",
    }));
  }

  /**
   * Xác định category của badge
   */
  private static getBadgeCategory(title: string): string {
    const titleLower = title.toLowerCase();

    if (titleLower.includes("trivia")) {
      return "Weekly Trivia";
    }

    if (
      titleLower.includes("arcade") &&
      (titleLower.includes("month") ||
        titleLower.includes("certification") ||
        titleLower.includes("game") ||
        titleLower.includes("base camp"))
    ) {
      return "Arcade Monthly/Game";
    }

    if (titleLower.includes("skill") || titleLower.includes("level")) {
      return "Skill Badge";
    }

    // Check for special edition badges
    if (
      titleLower.includes("extra") ||
      titleLower.includes("special") ||
      titleLower.includes("bonus") ||
      titleLower.includes("festival") ||
      titleLower.includes("challenge")
    ) {
      return "Special Edition";
    }

    return "Other";
  }

  /**
   * Tạo CSV content từ badge data
   */
  static generateCSVContent(badges: BadgeData[]): string {
    const csvData = this.convertBadgesToCSV(badges);

    // CSV Headers
    const headers = [
      "Badge Name",
      "Category",
      "Arcade Points",
      "Earned Date",
      "Image URL",
    ];

    // CSV Rows
    const rows = csvData.map((badge) => [
      `"${badge.badgeName}"`,
      `"${badge.category}"`,
      badge.arcadePoints.toString(),
      `"${badge.earnedDate}"`,
      `"${badge.imageUrl || ""}"`,
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    return csvContent;
  }

  /**
   * Tạo summary CSV với tổng điểm theo category
   */
  static generateSummaryCSV(arcadePoints: ArcadePoints): string {
    const summaryData = [
      ["Category", "Total Points"],
      ["Weekly Trivia", arcadePoints.triviaPoints.toString()],
      ["Arcade Monthly/Game/Base Camp", arcadePoints.gamePoints.toString()],
      ["Special Edition", arcadePoints.specialPoints.toString()],
      ["Skill Badges", arcadePoints.skillPoints.toString()],
      ["", ""],
      ["TOTAL ARCADE POINTS", arcadePoints.totalPoints.toString()],
    ];

    return summaryData
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
  }

  /**
   * Download CSV file trong browser
   */
  static downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  /**
   * Tạo và download badge CSV
   */
  static exportBadgesCSV(
    badges: BadgeData[],
    filename: string = "google-cloud-badges.csv"
  ): void {
    const csvContent = this.generateCSVContent(badges);
    this.downloadCSV(csvContent, filename);
    console.log(`📊 Exported ${badges.length} badges to ${filename}`);
  }

  /**
   * Tạo và download summary CSV
   */
  static exportSummaryCSV(
    arcadePoints: ArcadePoints,
    filename: string = "arcade-points-summary.csv"
  ): void {
    const csvContent = this.generateSummaryCSV(arcadePoints);
    this.downloadCSV(csvContent, filename);
    console.log(`📊 Exported arcade points summary to ${filename}`);
  }

  /**
   * Export full report (badges + summary)
   */
  static exportFullReport(
    badges: BadgeData[],
    arcadePoints: ArcadePoints
  ): void {
    // Export detailed badges
    this.exportBadgesCSV(
      badges,
      `google-cloud-badges-${new Date().toISOString().split("T")[0]}.csv`
    );

    // Export summary
    this.exportSummaryCSV(
      arcadePoints,
      `arcade-points-summary-${new Date().toISOString().split("T")[0]}.csv`
    );

    console.log("📊 Full report exported successfully!");
  }
}

export default CSVExportService;
