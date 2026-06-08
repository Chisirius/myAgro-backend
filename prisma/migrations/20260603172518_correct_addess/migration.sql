/*
  Warnings:

  - You are about to drop the column `city` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `landmark` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `Address` table. All the data in the column will be lost.
  - Added the required column `state` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `town` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Address" DROP COLUMN "city",
DROP COLUMN "landmark",
DROP COLUMN "region",
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "street" TEXT,
ADD COLUMN     "town" TEXT NOT NULL;
