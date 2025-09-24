/*
  Warnings:

  - Added the required column `permissions` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Group" ADD COLUMN     "permissions" JSONB NOT NULL;
