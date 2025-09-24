/*
  Warnings:

  - Added the required column `autorisations` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Group" ADD COLUMN     "autorisations" JSONB NOT NULL,
ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT true;
