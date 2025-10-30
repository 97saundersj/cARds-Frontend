import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/view-card/:id", "routes/view-card.tsx"),
  route("/webxr-test", "routes/webxr-test.tsx"),
] satisfies RouteConfig;
