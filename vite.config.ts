import { reactRouter } from "@react-router/dev/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: process.env.VITE_AZURE_DEPLOY
    ? "/"
    : process.env.GITHUB_ACTIONS
      ? "/cARds-Frontend/"
      : "/",
  plugins: [reactRouter(), tsconfigPaths(), basicSsl()],
  resolve: {
    dedupe: ["three", "@react-three/fiber"],
  },
  server: {
    host: true, // Listen on all network interfaces (accessible from phone on LAN)
    port: 5173,
  },
});
