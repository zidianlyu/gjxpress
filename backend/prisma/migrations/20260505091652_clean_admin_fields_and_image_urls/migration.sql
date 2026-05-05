/*
  Warnings:

  - The values [SERVICE_FEE,LOCAL_DELIVERY_FEE,ADJUSTMENT,OTHER] on the enum `TransactionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `display_name` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `height_cm` on the `inbound_packages` table. All the data in the column will be lost.
  - You are about to drop the column `label_image_url` on the `inbound_packages` table. All the data in the column will be lost.
  - You are about to drop the column `length_cm` on the `inbound_packages` table. All the data in the column will be lost.
  - You are about to drop the column `package_image_urls` on the `inbound_packages` table. All the data in the column will be lost.
  - You are about to drop the column `volume_cm3` on the `inbound_packages` table. All the data in the column will be lost.
  - You are about to drop the column `weight_kg` on the `inbound_packages` table. All the data in the column will be lost.
  - You are about to drop the column `width_cm` on the `inbound_packages` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `transaction_records` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `transaction_records` table. All the data in the column will be lost.
  - You are about to drop the column `payment_status` on the `transaction_records` table. All the data in the column will be lost.
  - Made the column `vendor_name` on table `master_shipments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `vendor_tracking_no` on table `master_shipments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `customer_shipment_id` on table `transaction_records` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionType_new" AS ENUM ('SHIPPING_FEE', 'REFUND');
ALTER TABLE "transaction_records" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "transaction_records" ALTER COLUMN "type" TYPE "TransactionType_new" USING ("type"::text::"TransactionType_new");
ALTER TYPE "TransactionType" RENAME TO "TransactionType_old";
ALTER TYPE "TransactionType_new" RENAME TO "TransactionType";
DROP TYPE "TransactionType_old";
ALTER TABLE "transaction_records" ALTER COLUMN "type" SET DEFAULT 'REFUND';
COMMIT;

-- DropForeignKey
ALTER TABLE "transaction_records" DROP CONSTRAINT "transaction_records_customer_shipment_id_fkey";

-- DropIndex
DROP INDEX "transaction_records_payment_status_idx";

-- AlterTable
ALTER TABLE "customer_shipments" ADD COLUMN     "actual_weight_kg" DECIMAL(10,3),
ADD COLUMN     "billing_rate_cny_per_kg" DECIMAL(10,2),
ADD COLUMN     "billing_weight_kg" DECIMAL(10,3),
ADD COLUMN     "image_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "volume_formula" VARCHAR(128);

-- AlterTable
ALTER TABLE "customers" DROP COLUMN "display_name",
ADD COLUMN     "wechat_id" VARCHAR(64);

-- AlterTable
ALTER TABLE "inbound_packages" DROP COLUMN "height_cm",
DROP COLUMN "label_image_url",
DROP COLUMN "length_cm",
DROP COLUMN "package_image_urls",
DROP COLUMN "volume_cm3",
DROP COLUMN "weight_kg",
DROP COLUMN "width_cm",
ADD COLUMN     "image_urls" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "master_shipments" ALTER COLUMN "vendor_name" SET NOT NULL,
ALTER COLUMN "vendor_tracking_no" SET NOT NULL;

-- AlterTable
ALTER TABLE "transaction_records" DROP COLUMN "currency",
DROP COLUMN "description",
DROP COLUMN "payment_status",
ALTER COLUMN "customer_shipment_id" SET NOT NULL,
ALTER COLUMN "type" SET DEFAULT 'REFUND';

-- CreateIndex
CREATE INDEX "customers_wechat_id_idx" ON "customers"("wechat_id");

-- AddForeignKey
ALTER TABLE "transaction_records" ADD CONSTRAINT "transaction_records_customer_shipment_id_fkey" FOREIGN KEY ("customer_shipment_id") REFERENCES "customer_shipments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
