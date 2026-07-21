import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function requirePatient() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }
  if (session.user.role !== "PATIENT") {
    redirect("/staff/dashboard");
  }
  return { userId: session.user.id };
}
