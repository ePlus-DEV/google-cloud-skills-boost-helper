import type { BadgeData } from "../types";
import PopupUIService from "./popupUIService";

/**
 * Service to handle badge rendering and pagination
 */
class BadgeService {
  private static currentPage = 1;
  private static readonly INCREMENT_COUNT = 3;

  /**
   * Render badges with pagination
   */
  static renderBadges(badges: BadgeData[]): void {
    const activityElement =
      PopupUIService.querySelector<HTMLDivElement>("#activity-list");
    if (!activityElement) return;

    if (!badges || badges.length === 0) {
      this.renderNoBadgesMessage(activityElement);
      return;
    }

    const totalPages = Math.ceil(badges.length / this.INCREMENT_COUNT);
    this.currentPage = 1;

    const renderPage = () => {
      activityElement.innerHTML = "";
      const start = 0;
      const end = this.currentPage * this.INCREMENT_COUNT;

      badges.slice(start, end).forEach((badge) => {
        const badgeElement = this.createBadgeElement(badge);
        activityElement.appendChild(badgeElement);
      });

      this.updatePaginationInfo(this.currentPage, totalPages);
    };

    renderPage();
    this.setupLoadMoreButton(totalPages, renderPage, badges);
  }

  /**
   * Create a single badge element
   */
  private static createBadgeElement(badge: BadgeData): HTMLDivElement {
    const badgeContainer = document.createElement("div");
    badgeContainer.className =
      "bg-white/10 backdrop-blur-md rounded-xl p-3 hover:bg-white/20 transition-colors duration-300 relative overflow-hidden group";

    badgeContainer.innerHTML = `
      <div class="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
      <div class="flex justify-between items-center">
        <div class="flex items-center">
          <img src="${badge.imageURL}" alt="${
      badge.title
    }" class="h-8 w-8 rounded-full border-2 border-white/50" />
          <div class="ml-3">
            <div class="text-white font-bold">${badge.title}</div>
            <div class="text-sm text-gray-300">${badge.dateEarned}</div>
          </div>
        </div>
        <div class="text-sm text-white">${
          badge.points
        } ${browser.i18n.getMessage("textPoints")}</div>
      </div>
    `;

    return badgeContainer;
  }

  /**
   * Setup load more button functionality
   */
  private static setupLoadMoreButton(
    totalPages: number,
    renderPage: () => void,
    badges: BadgeData[]
  ): void {
    const loadMoreButton =
      PopupUIService.querySelector<HTMLButtonElement>("#load-more");
    if (!loadMoreButton) return;

    const loadMoreButtonText =
      PopupUIService.querySelector<HTMLButtonElement>("#load-more-text");
    if (loadMoreButtonText) {
      loadMoreButtonText.textContent = browser.i18n.getMessage("labelLoadMore");
    }

    loadMoreButton.classList.remove("hidden");

    // Remove existing listeners
    const newButton = loadMoreButton.cloneNode(true) as HTMLButtonElement;
    loadMoreButton.parentNode?.replaceChild(newButton, loadMoreButton);

    newButton.addEventListener("click", () => {
      if (this.currentPage < totalPages) {
        this.currentPage++;
        renderPage();
      }
      if (this.currentPage === totalPages) {
        newButton.classList.add("hidden");
      }
    });
  }

  /**
   * Render no badges message
   */
  private static renderNoBadgesMessage(activityElement: HTMLDivElement): void {
    activityElement.innerHTML = `
      <div class="text-center bg-gradient-to-r from-gray-800 via-gray-900 to-black py-4 px-6 rounded-xl shadow-sm">
        <span class="text-gray-400 font-medium">${browser.i18n.getMessage(
          "messageNoDataAvailable"
        )}</span>
      </div>
    `;
  }

  /**
   * Update pagination information
   */
  private static updatePaginationInfo(
    currentPage: number,
    totalPages: number
  ): void {
    const paginationElement =
      PopupUIService.querySelector<HTMLDivElement>("#pagination-info");
    if (paginationElement) {
      paginationElement.textContent = `${browser.i18n.getMessage(
        "labelPage"
      )} ${currentPage}/${totalPages}`;
      paginationElement.classList.remove("hidden");
    }
  }
}

export default BadgeService;
