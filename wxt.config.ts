import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import type { Plugin } from "vite";

/** Inject popup-only bootstrap scripts and compact-mode CSS before app startup. */
function popupSizeBootstrapPlugin(): Plugin {
  return {
    name: "eplus-popup-size-bootstrap",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        if (!html.includes('id="popup-content"')) return html;

        return {
          html,
          tags: [
            {
              tag: "style",
              injectTo: "head-prepend",
              children: `
                html[data-popup-compact="true"] #popup-content {
                  min-height: 0 !important;
                }
                html[data-popup-compact="true"] #section-announcement,
                html[data-popup-compact="true"] #section-badges,
                html[data-popup-compact="true"] #milestones-section,
                html[data-popup-compact="true"] #countdown-container,
                html[data-popup-compact="true"] #section-activity,
                html[data-popup-compact="true"] #keyboard-hint {
                  display: none !important;
                }
              `,
            },
            {
              tag: "script",
              injectTo: "head-prepend",
              attrs: {
                src: "/popup-size-bootstrap.js",
              },
            },
            {
              tag: "script",
              injectTo: "head",
              attrs: {
                type: "module",
                src: "/entrypoints/popup/compactModeSync.ts",
              },
            },
            {
              tag: "script",
              injectTo: "head",
              attrs: {
                type: "module",
                src: "/entrypoints/popup/bonusMilestoneControl.tsx",
              },
            },
          ],
        };
      },
    },
  };
}

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: "__MSG_extName__",
    description: "__MSG_extDescription__",
    default_locale: "en",
    permissions: ["storage", "tabs"],
    optional_permissions: ["notifications"],
    browser_specific_settings: {
      gecko: {
        id: "{71243e5a-8ec2-41a5-8ef5-f2861ebd8fed}",
      },
    },
  },
  vite: () => ({
    plugins: [popupSizeBootstrapPlugin(), react(), tailwindcss()],
  }),
});
