/*
  Warnings:

  - The values [LOANED] on the enum `DocumentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [CLOSED] on the enum `DossiersStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `permissions` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `dueDate` on the `Loan` table. All the data in the column will be lost.
  - You are about to drop the column `lastLoginAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - The primary key for the `UserGroup` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[userId,groupId]` on the table `UserGroup` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."DocumentStatus_new" AS ENUM ('ACTIVE', 'ARCHIVED', 'DESTROYED');
ALTER TABLE "public"."Document" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Document" ALTER COLUMN "status" TYPE "public"."DocumentStatus_new" USING ("status"::text::"public"."DocumentStatus_new");
ALTER TYPE "public"."DocumentStatus" RENAME TO "DocumentStatus_old";
ALTER TYPE "public"."DocumentStatus_new" RENAME TO "DocumentStatus";
DROP TYPE "public"."DocumentStatus_old";
ALTER TABLE "public"."Document" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."DossiersStatus_new" AS ENUM ('ACTIVE', 'ARCHIVED', 'DESTROYED');
ALTER TABLE "public"."Dossier" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."TypeDocument" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."TypeDossier" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."TypeDocument" ALTER COLUMN "status" TYPE "public"."DossiersStatus_new" USING ("status"::text::"public"."DossiersStatus_new");
ALTER TABLE "public"."Dossier" ALTER COLUMN "status" TYPE "public"."DossiersStatus_new" USING ("status"::text::"public"."DossiersStatus_new");
ALTER TABLE "public"."TypeDossier" ALTER COLUMN "status" TYPE "public"."DossiersStatus_new" USING ("status"::text::"public"."DossiersStatus_new");
ALTER TYPE "public"."DossiersStatus" RENAME TO "DossiersStatus_old";
ALTER TYPE "public"."DossiersStatus_new" RENAME TO "DossiersStatus";
DROP TYPE "public"."DossiersStatus_old";
ALTER TABLE "public"."Dossier" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
ALTER TABLE "public"."TypeDocument" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
ALTER TABLE "public"."TypeDossier" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."UserGroup" DROP CONSTRAINT "UserGroup_groupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserGroup" DROP CONSTRAINT "UserGroup_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Group" DROP COLUMN "permissions",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."Loan" DROP COLUMN "dueDate";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "lastLoginAt",
DROP COLUMN "password",
ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."UserGroup" DROP CONSTRAINT "UserGroup_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "UserGroup_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserGroup_userId_groupId_key" ON "public"."UserGroup"("userId", "groupId");

-- AddForeignKey
ALTER TABLE "public"."UserGroup" ADD CONSTRAINT "UserGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserGroup" ADD CONSTRAINT "UserGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
