import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  platform: "neutral",
  define: {
    "import.meta.vitest": "null",
  },
  target: "esnext",
});
