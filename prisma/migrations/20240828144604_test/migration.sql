/*
  Warnings:

  - You are about to drop the `ReportBug` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RequestFeature` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ReportBug" DROP CONSTRAINT "ReportBug_user_id_fkey";

-- DropForeignKey
ALTER TABLE "RequestFeature" DROP CONSTRAINT "RequestFeature_user_id_fkey";

-- DropTable
DROP TABLE "ReportBug";

-- DropTable
DROP TABLE "RequestFeature";
