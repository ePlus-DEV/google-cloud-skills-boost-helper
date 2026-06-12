/**
 * Data Management Toggle Module
 * Handles show/hide for data management section
 */

/**
 * Initialize data management toggle functionality
 */
export function initDataManagementToggle(): void {
  const toggleBtn = document.getElementById("toggle-data-management");
  const content = document.getElementById("data-management-content");
  const chevron = document.getElementById("data-management-chevron");

  if (!toggleBtn || !content || !chevron) {
    return;
  }

  toggleBtn.addEventListener("click", () => {
    content.classList.toggle("hidden");
    chevron.classList.toggle("rotate-180");
  });
}
