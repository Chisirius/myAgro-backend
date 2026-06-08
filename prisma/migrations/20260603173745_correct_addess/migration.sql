/*
  Warnings:

  - Made the column `street` on table `Address` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "street" SET NOT NULL;
