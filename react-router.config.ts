import type { Config } from "@react-router/dev/config";

export default {
  // SPA mode for static deployment
  ssr: false,
  ...(process.env.GITHUB_ACTIONS &&
    !process.env.VITE_AZURE_DEPLOY && { basename: "/cARds-Frontend" }),
} satisfies Config;
