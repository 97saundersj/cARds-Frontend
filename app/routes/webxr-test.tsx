import type { Route } from "./+types/webxr-test";
import { ThreeJSTest } from "../Pages/ThreeJSTest";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Three.js WebXR Test" },
    {
      name: "description",
      content: "Testing Three.js with WebXR for AR experiences",
    },
  ];
}

export default function WebXRTest() {
  return <ThreeJSTest />;
}

