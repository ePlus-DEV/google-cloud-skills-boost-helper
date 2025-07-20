/**
 * UI Components for the extension
 */

class UIComponents {
  /**
   * Create a solution button element
   */
  static createSolutionElement(url: string | null): HTMLLIElement {
    const solutionElement = document.createElement("li");

    Object.assign(solutionElement.style, {
      marginTop: "15px",
      padding: "10px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    });

    solutionElement.innerHTML = url
      ? `
        <ql-button
          icon="check"
          type="button"
          title="Click to open the solution"
          data-aria-label="Click to open the solution"
          onclick="window.open('${url}', '_blank')"
        >
          Solution this lab
        </ql-button>
      `
      : `
        <ql-button icon="close" disabled>
          No solution
        </ql-button>
      `;

    return solutionElement;
  }

  /**
   * Create a copy button for profile links
   */
  static createCopyButton(linkElement: HTMLAnchorElement): HTMLButtonElement {
    const copyButton = document.createElement("button");
    copyButton.textContent = "Copy Link";

    Object.assign(copyButton.style, {
      marginLeft: "10px",
      padding: "5px 10px",
      fontSize: "14px",
      cursor: "pointer",
      backgroundColor: "#007bff",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
    });

    copyButton.addEventListener("click", (event) => {
      event.preventDefault();
      this.handleCopyLink(linkElement.href);
    });

    return copyButton;
  }

  /**
   * Handle copy link functionality
   */
  private static async handleCopyLink(href: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(href);

      const publicProfileElement = document.querySelector(
        ".ql-body-medium.public-profile.public",
      );

      if (publicProfileElement) {
        publicProfileElement.insertAdjacentHTML(
          "afterend",
          `<ql-infobox id="clipboard" class="l-mtl"> ${browser.i18n.getMessage(
            "messageLinkCopiedToClipboard",
          )} </ql-infobox>`,
        );
      }

      setTimeout(() => {
        const clipboardElement = document.querySelector("#clipboard");
        clipboardElement?.remove();
      }, 4000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  }
}

export default UIComponents;
