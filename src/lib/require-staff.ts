import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const staffRoles: Role[] = ["FRONT_DESK", "SUPERVISOR", "DOCTOR"];

export async function requireStaff() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/staff/login?callbackUrl=/staff/dashboard");
  }
  if (!staffRoles.includes(session.user.role)) {
    redirect("/dashboard");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { department: true, role: true },
  });
  if (!user || !staffRoles.includes(user.role)) {
    redirect("/dashboard");
  }
  if (!user.department) {
    redirect("/staff/login");
  }

  return { userId: session.user.id, role: user.role, department: user.department };
}
