import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: process.env.VITE_AZURE_DEPLOY
    ? "/"
    : process.env.GITHUB_ACTIONS
      ? "/cARds-Frontend/"
      : "/",
  plugins: [reactRouter(), tsconfigPaths()],
  resolve: {
    dedupe: ["three", "@react-three/fiber"],
  },
  server: {
    host: true, // Listen on all network interfaces
    port: 5173,
  },
});
