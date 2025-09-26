-- AlterTable
ALTER TABLE "public"."Localisation" ALTER COLUMN "code" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."TypeDocument" ADD COLUMN     "description" TEXT;
