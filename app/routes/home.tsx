import type { Route } from "./+types/home";
import { CardEditor } from "../Pages/CardEditor";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AR Greeting Card Generator" },
    {
      name: "description",
      content:
        "Create your own web based Augmented Reality greeting cards for any occasion!",
    },
  ];
}

export default function Home() {
  return <CardEditor />;
}
