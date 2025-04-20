import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/pages/", // ← ✅ Set this to your repo name
  plugins: [react()],
  server: {
    port: 5173,
  },
  assetsInclude: ["**/*.md"],
});