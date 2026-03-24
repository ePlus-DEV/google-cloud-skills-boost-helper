import type { ArcadeData, BadgeData, Account } from "../types";

/**
 * Service to handle exporting user data to CSV or JSON
 */
const ExportService = {
  /**
   * Export arcade data as JSON and trigger download
   */
  exportAsJSON(data: ArcadeData, filename = "arcade-data"): void {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      ...data,
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json",
    });
    this.triggerDownload(blob, `${filename}.json`);
  },

  /**
   * Export badges as CSV and trigger download
   */
  exportBadgesAsCSV(badges: BadgeData[], filename = "badges"): void {
    const headers = ["Title", "Date Earned", "Points", "Image URL"];
    const rows = badges.map((b) => [
      this.escapeCsvField(b.title),
      this.escapeCsvField(b.dateEarned),
      String(b.points),
      this.escapeCsvField(b.imageURL),
    ]);

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    this.triggerDownload(blob, `${filename}.csv`);
  },

  /**
   * Export full account data (all accounts) as JSON
   */
  exportAccountsAsJSON(accounts: Account[], filename = "all-accounts"): void {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      accounts: accounts.map((acc) => ({
        name: acc.name,
        nickname: acc.nickname,
        profileUrl: acc.profileUrl,
        createdAt: acc.createdAt,
        lastUsed: acc.lastUsed,
        facilitatorProgram: acc.facilitatorProgram,
        arcadeData: acc.arcadeData,
      })),
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json",
    });
    this.triggerDownload(blob, `${filename}.json`);
  },

  /**
   * Escape a CSV field value (wrap in quotes if it contains comma, quote, or newline)
   */
  escapeCsvField(value: string): string {
    if (/[",\n\r]/.test(value)) {
      return `"${value.replaceAll('"', '""')}"`;
    }
    return value;
  },

  /**
   * Trigger a file download in the browser
   */
  triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
};

export default ExportService;
