import type { Account, ArcadeData, UserDetail, CompletedBadge } from "../types";
import { DOMUtils } from "./domUtils";

/**
 * Preview utility functions for updating preview elements
 */
export const PreviewUtils = {
  /**
   * Update preview name
   */
  updateName(account: Account, userDetail: UserDetail): void {
    const displayName = account.nickname || userDetail.userName || account.name;
    DOMUtils.setTextContent("preview-name", displayName);

    // Update name display input if exists
    DOMUtils.setInputValue("account-name-display", userDetail.userName || "");
  },

  /**
   * Update preview email (UserDetail doesn't have userEmail, keep for compatibility)
   */
  updateEmail(_userDetail?: UserDetail): void {
    // UserDetail interface doesn't have userEmail field
    // This method is kept for compatibility but will show empty
    DOMUtils.updateTextWithFallback("preview-email", "", "");
  },

  /**
   * Update preview avatar
   */
  updateAvatar(userDetail: UserDetail, account?: Account): void {
    const previewAvatar =
      DOMUtils.getElementById<HTMLImageElement>("preview-avatar");
    const previewAvatarPlaceholder = DOMUtils.getElementById(
      "preview-avatar-placeholder"
    );

    if (userDetail.profileImage && previewAvatar) {
      DOMUtils.setImageSrc("preview-avatar", userDetail.profileImage);
      if (previewAvatarPlaceholder) {
        previewAvatarPlaceholder.style.display = "none";
      }
    } else if (previewAvatarPlaceholder && account) {
      // Show placeholder with first letter
      const firstLetter = (userDetail.userName || account.name || "U")
        .charAt(0)
        .toUpperCase();
      previewAvatarPlaceholder.innerHTML = firstLetter;
      previewAvatarPlaceholder.style.display = "block";
      if (previewAvatar) {
        previewAvatar.style.display = "none";
      }
    }
  },

  /**
   * Update preview arcade points
   */
  updateArcadePoints(arcadeData: ArcadeData): void {
    const points =
      arcadeData.arcadePoints?.totalPoints || arcadeData.totalArcadePoints || 0;
    DOMUtils.updateTextWithFallback(
      "preview-arcade-points",
      `${points.toLocaleString()} points`,
      "0 points"
    );
  },

  /**
   * Update preview total arcade points
   */
  updateArcadeTotal(arcadeData: ArcadeData): void {
    const points =
      arcadeData.arcadePoints?.totalPoints || arcadeData.totalArcadePoints || 0;
    DOMUtils.updateTextWithFallback(
      "preview-arcade-total",
      points.toLocaleString(),
      "0"
    );
  },

  /**
   * Update preview total badges
   */
  updateTotalBadges(userDetail: UserDetail): void {
    const totalBadges = userDetail.completedBadgeIds?.length || 0;
    DOMUtils.updateTextWithFallback(
      "preview-total-badges",
      totalBadges.toString(),
      "0"
    );
  },

  /**
   * Update preview skill badges
   */
  updateSkillBadges(userDetail: UserDetail): void {
    let skillBadges = 0;
    if (userDetail.completedBadgeIds) {
      skillBadges = userDetail.completedBadgeIds.filter(
        (badge: CompletedBadge) =>
          badge.badgeType === "SKILL" || badge.type === "skill"
      ).length;
    }
    DOMUtils.updateTextWithFallback(
      "preview-skill-badges",
      skillBadges.toString(),
      "0"
    );
  },

  /**
   * Update preview last updated
   */
  updateLastUpdated(): void {
    const currentDate = new Date().toLocaleDateString("vi-VN");
    DOMUtils.setTextContent("preview-last-updated", currentDate);
  },

  /**
   * Update preview points in main display
   */
  updateMainPoints(arcadeData: ArcadeData): void {
    let pointsText = "0 Arcade Points";

    if (arcadeData.arcadePoints?.totalPoints !== undefined) {
      pointsText = `${arcadeData.arcadePoints.totalPoints.toLocaleString()} Arcade Points`;
    } else if (arcadeData.totalArcadePoints !== undefined) {
      pointsText = `${arcadeData.totalArcadePoints.toLocaleString()} Arcade Points`;
    }

    DOMUtils.setTextContent("preview-points", pointsText);
  },

  /**
   * Update complete account preview
   */
  updateAccountPreview(
    account: Account,
    userDetail: UserDetail,
    arcadeData: ArcadeData
  ): void {
    this.updateName(account, userDetail);
    this.updateEmail(userDetail);
    this.updateAvatar(userDetail, account);
    this.updateArcadePoints(arcadeData);
    this.updateArcadeTotal(arcadeData);
    this.updateTotalBadges(userDetail);
    this.updateSkillBadges(userDetail);
    this.updateLastUpdated();
    this.updateMainPoints(arcadeData);
  },
};
