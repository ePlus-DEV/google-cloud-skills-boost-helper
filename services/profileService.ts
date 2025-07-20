import UIComponents from "../components/uiComponents";

/**
 * Service to handle profile page functionality
 */
class ProfileService {
  /**
   * Handle public profile checkbox and setup
   */
  static setupPublicProfile(): void {
    const publicProfileChecked = document.querySelector<HTMLInputElement>(
      "#public_profile_checked",
    );

    if (publicProfileChecked && !publicProfileChecked.checked) {
      publicProfileChecked.checked = true;

      const formElement = document.querySelector(".simple_form.edit_user");
      if (formElement) {
        formElement.insertAdjacentHTML(
          "afterend",
          `<ql-warningbox> ${browser.i18n.getMessage(
            "notePleaseSetUpTheSettings",
          )} </ql-warningbox>`,
        );
      }
    }
  }

  /**
   * Add copy button to public profile link
   */
  static setupPublicProfileCopyButton(): void {
    const publicProfileElement = document.querySelector(
      ".ql-body-medium.public-profile.public",
    );

    if (publicProfileElement) {
      const linkElement = publicProfileElement.querySelector("a");
      if (linkElement) {
        const copyButton = UIComponents.createCopyButton(linkElement);
        publicProfileElement.appendChild(copyButton);
      }
    }
  }

  /**
   * Handle auto-scroll to public profile section if hash is present
   */
  static handleAutoScroll(): void {
    if (window.location.hash === "#public-profile") {
      const publicProfileElement = document.querySelector("#public-profile");
      if (publicProfileElement) {
        const elementPosition =
          publicProfileElement.getBoundingClientRect().top + window.pageYOffset;

        window.scrollTo({
          top: elementPosition,
          behavior: "smooth",
        });
      }
    }
  }

  /**
   * Initialize all profile page functionality
   */
  static initialize(): void {
    this.setupPublicProfile();
    this.setupPublicProfileCopyButton();
    this.handleAutoScroll();
  }
}

export default ProfileService;
