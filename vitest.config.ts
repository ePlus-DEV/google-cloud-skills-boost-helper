import { defineConfig } from "vitest/config";
import { WxtVitest } from "wxt/testing/vitest-plugin";

export default defineConfig({
  plugins: [WxtVitest()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["services/**/*.ts", "utils/**/*.ts"],
      exclude: [
        "services/index.ts",
        "utils/index.ts",
        // UI/DOM-heavy services tightly coupled to browser extension runtime
        "services/badgeService.ts",
        "services/browserService.ts",
        "services/firebaseService.ts",
        "services/labService.ts",
        "services/markdownService.ts",
        "services/optionsService.ts",
        "services/popupService.ts",
        "services/popupUIService.ts",
        "services/profileService.ts",
        "services/tourService.ts",
        "services/apiClient.ts",
        "utils/seasonConfigHelper.ts",
        "utils/storage.ts",
      ],
      reporter: ["text", "lcov", "html"],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60,
      },
    },
  },
});
