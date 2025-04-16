import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import md from "vite-plugin-md";

export default defineConfig({
  base: "/pages/",
  plugins: [react(), md()]
});