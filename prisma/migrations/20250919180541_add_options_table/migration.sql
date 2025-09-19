-- AlterTable
ALTER TABLE "public"."Series" ADD COLUMN     "dcl" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "dua" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "public"."Options" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Options_key_key" ON "public"."Options"("key");
