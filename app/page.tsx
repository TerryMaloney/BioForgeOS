import { RedirectType, redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard", RedirectType.replace);
}
