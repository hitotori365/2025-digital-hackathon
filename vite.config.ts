import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        background: resolve(__dirname, "src/background.ts"),
        contentScript: resolve(__dirname, "src/contentScript.ts"),
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
    outDir: "dist",
    emptyOutDir: true,
  },
});
