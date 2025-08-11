/**
 * DOM utility functions for common DOM operations
 */

export const DOMUtils = {
  /**
   * Get element by ID with type casting
   */
  getElementById<T extends HTMLElement = HTMLElement>(id: string): T | null {
    return document.getElementById(id) as T | null;
  },

  /**
   * Get input element by ID
   */
  getInputElement(id: string): HTMLInputElement | null {
    return this.getElementById<HTMLInputElement>(id);
  },

  /**
   * Get textarea element by ID
   */
  getTextAreaElement(id: string): HTMLTextAreaElement | null {
    return this.getElementById<HTMLTextAreaElement>(id);
  },

  /**
   * Set text content for element
   */
  setTextContent(id: string, content: string): void {
    const element = this.getElementById(id);
    if (element) {
      element.textContent = content;
    }
  },

  /**
   * Set input value
   */
  setInputValue(id: string, value: string): void {
    const input = this.getInputElement(id);
    if (input) {
      input.value = value;
    }
  },

  /**
   * Get input value
   */
  getInputValue(id: string): string {
    const input = this.getInputElement(id);
    return input?.value?.trim() || "";
  },

  /**
   * Show/hide element
   */
  toggleElementVisibility(id: string, show: boolean): void {
    const element = this.getElementById(id);
    if (element) {
      if (show) {
        element.classList.remove("hidden");
      } else {
        element.classList.add("hidden");
      }
    }
  },

  /**
   * Add event listener to element
   */
  addEventListener(id: string, event: string, handler: EventListener): void {
    const element = this.getElementById(id);
    if (element) {
      element.addEventListener(event, handler);
    }
  },

  /**
   * Setup multiple event listeners with proper typing
   */
  setupEventListeners(
    config: Array<{
      id: string;
      event: string;
      handler: (event: Event) => void | Promise<void>;
    }>,
  ): void {
    config.forEach(({ id, event, handler }) => {
      this.addEventListener(id, event, handler as EventListener);
    });
  },

  /**
   * Set image source
   */
  setImageSrc(id: string, src: string): void {
    const img = this.getElementById<HTMLImageElement>(id);
    if (img) {
      img.src = src;
      img.style.display = "block";
    }
  },

  /**
   * Clear multiple input fields
   */
  clearInputs(ids: string[]): void {
    ids.forEach((id) => {
      this.setInputValue(id, "");
    });
  },

  /**
   * Update element text content with fallback
   */
  updateTextWithFallback(
    id: string,
    content: string | number | undefined,
    fallback: string = "0",
  ): void {
    const element = this.getElementById(id);
    if (element) {
      element.textContent = content ? content.toString() : fallback;
    }
  },
};
