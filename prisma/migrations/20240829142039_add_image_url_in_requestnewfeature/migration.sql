/*
  Warnings:

  - Added the required column `url_image` to the `ReportBug` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url_image` to the `RequestFeature` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReportBug" ADD COLUMN     "url_image" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RequestFeature" ADD COLUMN     "url_image" TEXT NOT NULL;
