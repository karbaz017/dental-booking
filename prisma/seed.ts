import { hash } from "bcryptjs";
import { Department, PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const password = await hash("Demo1234!", 12);

  await prisma.user.upsert({
    where: { email: "doctor@demo.clinic" },
    update: {
      passwordHash: password,
      name: "Dr. Avery Kim",
      role: Role.DOCTOR,
      department: Department.GENERAL_DENTISTRY,
    },
    create: {
      email: "doctor@demo.clinic",
      name: "Dr. Avery Kim",
      passwordHash: password,
      role: Role.DOCTOR,
      department: Department.GENERAL_DENTISTRY,
    },
  });

  await prisma.user.upsert({
    where: { email: "frontdesk@demo.clinic" },
    update: {
      passwordHash: password,
      name: "Jordan Lee",
      role: Role.FRONT_DESK,
      department: Department.GENERAL_DENTISTRY,
    },
    create: {
      email: "frontdesk@demo.clinic",
      name: "Jordan Lee",
      passwordHash: password,
      role: Role.FRONT_DESK,
      department: Department.GENERAL_DENTISTRY,
    },
  });

  await prisma.user.upsert({
    where: { email: "supervisor@demo.clinic" },
    update: {
      passwordHash: password,
      name: "Sam Rivera",
      role: Role.SUPERVISOR,
      department: Department.GENERAL_DENTISTRY,
    },
    create: {
      email: "supervisor@demo.clinic",
      name: "Sam Rivera",
      passwordHash: password,
      role: Role.SUPERVISOR,
      department: Department.GENERAL_DENTISTRY,
    },
  });

  console.log(
    "Seed OK: doctor@demo.clinic, frontdesk@demo.clinic, supervisor@demo.clinic — password Demo1234!",
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
