-- CreateEnum
CREATE TYPE "Department" AS ENUM ('GENERAL_DENTISTRY', 'ORTHODONTICS', 'PEDIATRICS', 'ORAL_SURGERY', 'ENDODONTICS');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "department" "Department";
