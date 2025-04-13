export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(async ({ reason }) => {
    // Check if the extension is being installed
    if (reason !== "install") return;

    // Open a tab on install
    await browser.tabs.create({
      url: browser.runtime.getURL("/options.html"),
      active: true,
    });
  });
});
