import { redirect, RedirectType } from "next/navigation";
export default function ClinicPage() {
  return redirect("/clinic/hr", RedirectType.replace);
}
