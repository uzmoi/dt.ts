import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    includeSource: [],
    coverage: {
      include: ["src"],
    },
  },
});
