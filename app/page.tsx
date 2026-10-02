import { redirect } from "next/navigation";

export default function Home() {
  redirect("/paper-1?lang=en");
}
