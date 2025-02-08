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
        // 出力ファイル名をエントリーポイント名に合わせる
        entryFileNames: "[name].js",
      },
    },
    outDir: "dist", // 出力先（public の内容はそのままコピーされます）
    emptyOutDir: true,
  },
});
