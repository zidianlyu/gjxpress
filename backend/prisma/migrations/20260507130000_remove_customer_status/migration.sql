-- DropIndex
DROP INDEX "customers_status_idx";

-- AlterTable
ALTER TABLE "customers" DROP COLUMN "status";

-- DropEnum
DROP TYPE "CustomerStatus";
