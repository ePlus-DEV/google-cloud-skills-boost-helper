/**
 * Modal utility functions to handle common modal operations
 */

export interface ModalConfig {
  modalId: string;
  clearFields?: string[];
  closeButtonIds?: string[];
  onOpen?: () => void;
  onClose?: () => void;
}

export const ModalUtils = {
  /**
   * Show modal with flex display
   */
  showModal(modalId: string, config?: Partial<ModalConfig>): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");

      // Clear form fields if specified
      if (config?.clearFields) {
        this.clearFormFields(config.clearFields);
      }

      // Execute onOpen callback
      config?.onOpen?.();
    }
  },

  /**
   * Hide modal
   */
  hideModal(modalId: string, config?: Partial<ModalConfig>): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");

      // Execute onClose callback
      config?.onClose?.();
    }
  },

  /**
   * Clear form fields
   */
  clearFormFields(fieldIds: string[]): void {
    fieldIds.forEach((fieldId) => {
      const element = document.getElementById(fieldId) as
        | HTMLInputElement
        | HTMLTextAreaElement;
      if (element) {
        element.value = "";
      }
    });
  },

  /**
   * Setup modal event listeners
   */
  setupModalEvents(config: ModalConfig): void {
    // Setup close buttons
    if (config.closeButtonIds) {
      config.closeButtonIds.forEach((buttonId) => {
        const button = document.getElementById(buttonId);
        if (button) {
          button.addEventListener("click", () => {
            this.hideModal(config.modalId, config);
          });
        }
      });
    }

    // Setup click outside to close
    const modal = document.getElementById(config.modalId);
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.hideModal(config.modalId, config);
        }
      });
    }
  },

  /**
   * Setup common modal with standard close buttons
   */
  setupStandardModal(
    modalId: string,
    closeButtonIds: string[] = [],
    clearFields: string[] = [],
    callbacks?: { onOpen?: () => void; onClose?: () => void }
  ): void {
    const config: ModalConfig = {
      modalId,
      clearFields,
      closeButtonIds,
      ...callbacks,
    };

    this.setupModalEvents(config);
  },
};
