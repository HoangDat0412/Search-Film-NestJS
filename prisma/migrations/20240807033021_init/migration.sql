-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_2fa" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_verify" BOOLEAN NOT NULL DEFAULT false;
