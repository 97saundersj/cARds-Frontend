import type { Route } from "./+types/view-card";
import { ViewCard } from "../Pages/ViewCard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AR Greeting Card" },
    { name: "description", content: "View your custom AR greeting card" },
  ];
}

export default function ViewCardRoute() {
  return <ViewCard />;
}
