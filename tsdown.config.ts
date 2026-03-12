import { defineConfig } from "tsdown";

export default defineConfig({
  platform: "neutral",
  define: {
    "import.meta.vitest": "null",
  },
});
