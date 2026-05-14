import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: "__MSG_extName__",
    description: "__MSG_extDescription__",
    default_locale: "en",
    permissions: ["storage", "tabs"],
    host_permissions: ["https://gql-beta.hashnode.com/*"],
    browser_specific_settings: {
      gecko: {
        id: "{71243e5a-8ec2-41a5-8ef5-f2861ebd8fed}",
      },
    },
  },
  vite: () => ({
    plugins: [react(), tailwindcss()],
  }),
});
