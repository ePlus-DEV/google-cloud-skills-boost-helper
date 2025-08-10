/**
 * Service to handle guided tour functionality using custom implementation
 */
const TourService = {
  currentStep: 0,
  steps: [] as Array<{
    element: string;
    title: string;
    content: string;
    position: "top" | "bottom" | "left" | "right";
  }>,
  overlay: null as HTMLElement | null,
  tooltip: null as HTMLElement | null,

  /**
   * Get localized message
   */
  getMessage(key: string, substitutions?: string[]): string {
    try {
      // Type assertion for dynamic key access
      const browserI18n = browser.i18n as {
        getMessage: (key: string, substitutions?: string[]) => string;
      };
      return browserI18n.getMessage(key, substitutions) || key;
    } catch (error) {
      return key;
    }
  },

  /**
   * Initialize the account creation tour
   */
  startAccountCreationTour(): void {
    // Starting account creation tour

    this.steps = [
      {
        element: "#add-account-btn",
        title: this.getMessage("tourAddAccountTitle"),
        content: this.getMessage("tourAddAccountContent"),
        position: "bottom",
      },
      {
        element: "#accounts-list",
        title: this.getMessage("tourAccountListTitle"),
        content: this.getMessage("tourAccountListContent"),
        position: "top",
      },
    ];

    this.currentStep = 0;
    this.showStep();
  },

  /**
   * Start modal tour (when user opens the add account modal)
   */
  startModalTour(): void {
    // Starting modal tour

    setTimeout(() => {
      this.steps = [
        {
          element: "#go-to-profile-page-btn",
          title: this.getMessage("tourModalStep1Title"),
          content: this.getMessage("tourModalStep1Content"),
          position: "bottom",
        },
        {
          element: "#account-url-input",
          title: this.getMessage("tourModalStep2Title"),
          content: `${this.getMessage(
            "tourModalStep2Content"
          )}<br><div class="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2"><p class="text-xs text-yellow-800"><i class="fa-solid fa-lightbulb mr-1"></i>${this.getMessage(
            "tourModalStep2Tip"
          )}</p></div>`,
          position: "bottom",
        },
        {
          element: "#create-account-btn",
          title: this.getMessage("tourModalStep3Title"),
          content: this.getMessage("tourModalStep3Content"),
          position: "top",
        },
      ];

      this.currentStep = 0;
      this.showStep();
    }, 300);
  },

  /**
   * Show current step
   */
  showStep(): void {
    if (this.currentStep >= this.steps.length) {
      this.endTour();
      return;
    }

    const step = this.steps[this.currentStep];
    const element = document.querySelector(step.element) as HTMLElement;

    if (!element) {
      // Element not found, skipping step
      this.nextStep();
      return;
    }

    this.createOverlay();
    this.createTooltip(step, element);
    this.highlightElement(element);
  },

  /**
   * Create overlay
   */
  createOverlay(): void {
    this.removeOverlay();

    this.overlay = document.createElement("div");
    this.overlay.className = "tour-overlay";
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.6);
      z-index: 999999;
      pointer-events: none;
    `;

    document.body.appendChild(this.overlay);
  },

  /**
   * Create tooltip
   */
  createTooltip(step: (typeof this.steps)[0], element: HTMLElement): void {
    this.removeTooltip();

    this.tooltip = document.createElement("div");
    this.tooltip.className = "tour-tooltip";
    this.tooltip.style.cssText = `
      position: fixed;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      border: 1px solid #e2e8f0;
      padding: 20px;
      max-width: 400px;
      min-width: 300px;
      z-index: 1000000;
      font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      pointer-events: auto;
    `;

    this.tooltip.innerHTML = `
      <div class="tour-content">
        <h4 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #374151;">
          ${step.title}
        </h4>
        <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.5; color: #6b7280;">
          ${step.content}
        </p>
        <div class="tour-buttons" style="display: flex; gap: 10px; justify-content: flex-end;">
          ${
            this.currentStep > 0
              ? `
            <button class="tour-btn-prev" style="
              background: #f3f4f6;
              color: #374151;
              border: 1px solid #d1d5db;
              padding: 8px 16px;
              border-radius: 8px;
              font-size: 13px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
            " onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'">
              ← ${this.getMessage("tourButtonPrevious")}
            </button>
          `
              : ""
          }
          <button class="tour-btn-skip" style="
            background: transparent;
            color: #6b7280;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            cursor: pointer;
            text-decoration: underline;
          " onmouseover="this.style.color='#374151'" onmouseout="this.style.color='#6b7280'">
            ${this.getMessage("tourButtonSkip")}
          </button>
          <button class="tour-btn-next" style="
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          " onmouseover="this.style.background='linear-gradient(135deg, #2563eb, #1e40af)'; this.style.transform='translateY(-1px)'" onmouseout="this.style.background='linear-gradient(135deg, #3b82f6, #1d4ed8)'; this.style.transform='translateY(0)'">
            ${
              this.currentStep === this.steps.length - 1
                ? this.getMessage("tourButtonComplete")
                : this.getMessage("tourButtonNext") + " →"
            }
          </button>
        </div>
      </div>
    `;

    // Position tooltip
    document.body.appendChild(this.tooltip);
    this.positionTooltip(this.tooltip, element);

    // Add event listeners
    const prevBtn = this.tooltip.querySelector(".tour-btn-prev");
    const nextBtn = this.tooltip.querySelector(".tour-btn-next");
    const skipBtn = this.tooltip.querySelector(".tour-btn-skip");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => this.prevStep());
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => this.nextStep());
    }

    if (skipBtn) {
      skipBtn.addEventListener("click", () => this.endTour());
    }
  },

  /**
   * Position tooltip relative to element
   */
  positionTooltip(tooltip: HTMLElement, element: HTMLElement): void {
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate preferred position (below target, centered)
    let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
    let top = rect.bottom + 12;

    // Ensure tooltip stays within viewport horizontally with better margins
    const margin = 20;
    if (left < margin) {
      left = margin;
    } else if (left + tooltipRect.width > viewportWidth - margin) {
      left = viewportWidth - tooltipRect.width - margin;
    }

    // Check if tooltip would go below viewport
    if (top + tooltipRect.height > viewportHeight - margin) {
      // Position above target instead
      top = rect.top - tooltipRect.height - 12;

      // If still not fitting, position it in the viewport center
      if (top < margin) {
        top = Math.max(margin, (viewportHeight - tooltipRect.height) / 2);

        // Try positioning to the side if there's space
        if (rect.left > tooltipRect.width + margin * 2) {
          left = rect.left - tooltipRect.width - 12;
          top = rect.top + rect.height / 2 - tooltipRect.height / 2;
        } else if (
          rect.right + tooltipRect.width + margin * 2 <
          viewportWidth
        ) {
          left = rect.right + 12;
          top = rect.top + rect.height / 2 - tooltipRect.height / 2;
        }
      }
    }

    // Final bounds check to ensure tooltip is fully visible
    top = Math.max(
      margin,
      Math.min(top, viewportHeight - tooltipRect.height - margin),
    );
    left = Math.max(
      margin,
      Math.min(left, viewportWidth - tooltipRect.width - margin),
    );

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  },

  /**
   * Highlight element
   */
  highlightElement(element: HTMLElement): void {
    // Remove previous highlights
    document.querySelectorAll(".tour-highlight").forEach((el) => {
      el.classList.remove("tour-highlight");
    });

    // Add highlight to current element
    element.classList.add("tour-highlight");
    element.style.position = "relative";
    element.style.zIndex = "999998";
    element.style.boxShadow =
      "0 0 0 4px rgba(59, 130, 246, 0.6), 0 0 0 8px rgba(59, 130, 246, 0.3)";
    element.style.borderRadius = "8px";

    // Scroll to element
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  },

  /**
   * Remove highlight from element
   */
  removeHighlight(): void {
    document.querySelectorAll(".tour-highlight").forEach((el) => {
      el.classList.remove("tour-highlight");
      (el as HTMLElement).style.zIndex = "";
      (el as HTMLElement).style.boxShadow = "";
      (el as HTMLElement).style.borderRadius = "";
    });
  },

  /**
   * Next step
   */
  nextStep(): void {
    this.currentStep++;
    this.showStep();
  },

  /**
   * Previous step
   */
  prevStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.showStep();
    }
  },

  /**
   * End tour
   */
  endTour(): void {
    this.removeOverlay();
    this.removeTooltip();
    this.removeHighlight();
    this.showCompletionMessage();
    this.markTourCompleted();
  },

  /**
   * Remove overlay
   */
  removeOverlay(): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  },

  /**
   * Remove tooltip
   */
  removeTooltip(): void {
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }
  },

  /**
   * Show completion message
   */
  showCompletionMessage(): void {
    const messageElement = document.createElement("div");
    messageElement.className =
      "fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl z-50 max-w-sm";
    messageElement.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <i class="fa-solid fa-check-circle text-xl"></i>
        </div>
        <div class="ml-3">
          <h4 class="font-semibold">Hoàn thành hướng dẫn!</h4>
          <p class="text-sm mt-1">Bây giờ bạn có thể bắt đầu tạo tài khoản đầu tiên.</p>
        </div>
        <button class="ml-2 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
    `;

    document.body.appendChild(messageElement);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.remove();
      }
    }, 5000);
  },

  /**
   * Check if user should see the tour (first time user)
   */
  async shouldShowTour(): Promise<boolean> {
    try {
      // Check if tour has been shown before
      const result = await browser.storage.local.get(["tourCompleted"]);
      return !result.tourCompleted;
    } catch (error) {
      console.error("Error checking tour status:", error);
      return false;
    }
  },

  /**
   * Mark tour as completed
   */
  async markTourCompleted(): Promise<void> {
    try {
      await browser.storage.local.set({ tourCompleted: true });
    } catch (error) {
      console.error("Error marking tour as completed:", error);
    }
  },

  /**
   * Reset tour status (for testing)
   */
  async resetTourStatus(): Promise<void> {
    try {
      await browser.storage.local.remove(["tourCompleted"]);
    } catch (error) {
      console.error("Error resetting tour status:", error);
    }
  },
};

export default TourService;
