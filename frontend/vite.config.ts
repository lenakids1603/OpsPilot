/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(() => {
  return {
    root: path.resolve(__dirname, "."),
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@shared": path.resolve(__dirname, "../shared"),
      },
    },
    build: {
      outDir: path.resolve(__dirname, "../dist"),
      emptyOutDir: true,
    },
    server: {
      host: "127.0.0.1",
      port: 3000,
      allowedHosts: ["erp.lenakids.com"],
      hmr: process.env.DISABLE_HMR !== "true",
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      host: "127.0.0.1",
      port: 3000,
      allowedHosts: ["erp.lenakids.com"],
    },
  };
});
