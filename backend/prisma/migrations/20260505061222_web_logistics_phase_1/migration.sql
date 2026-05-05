-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('OWNER', 'ADMIN', 'WAREHOUSE_STAFF', 'US_STAFF', 'VIEWER');

-- CreateEnum
CREATE TYPE "AdminStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "InboundPackageStatus" AS ENUM ('UNCLAIMED', 'CLAIMED', 'PREALERTED_NOT_ARRIVED', 'ARRIVED_WAREHOUSE', 'PENDING_CONFIRMATION', 'CONFIRMED', 'ISSUE_REPORTED', 'CONSOLIDATED', 'INBOUND_EXCEPTION');

-- CreateEnum
CREATE TYPE "CustomerShipmentStatus" AS ENUM ('DRAFT', 'PACKED', 'SENT_TO_OVERSEAS', 'ARRIVED_OVERSEAS', 'READY_FOR_PICKUP', 'LOCAL_DELIVERY_REQUESTED', 'LOCAL_DELIVERY_IN_PROGRESS', 'PICKED_UP', 'COMPLETED', 'EXCEPTION');

-- CreateEnum
CREATE TYPE "MasterShipmentStatus" AS ENUM ('CREATED', 'HANDED_TO_VENDOR', 'IN_TRANSIT', 'TRANSFER_OR_CUSTOMS_PROCESSING', 'ARRIVED_OVERSEAS', 'CLOSED', 'EXCEPTION');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('SERVICE_FEE', 'SHIPPING_FEE', 'LOCAL_DELIVERY_FEE', 'ADJUSTMENT', 'REFUND', 'OTHER');

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'PENDING';

-- DropForeignKey
ALTER TABLE "address_usages" DROP CONSTRAINT "address_usages_userId_fkey";

-- DropForeignKey
ALTER TABLE "admin_action_logs" DROP CONSTRAINT "admin_action_logs_adminId_fkey";

-- DropForeignKey
ALTER TABLE "exception_cases" DROP CONSTRAINT "exception_cases_orderId_fkey";

-- DropForeignKey
ALTER TABLE "exception_cases" DROP CONSTRAINT "exception_cases_packageId_fkey";

-- DropForeignKey
ALTER TABLE "inbound_records" DROP CONSTRAINT "inbound_records_operatorAdminId_fkey";

-- DropForeignKey
ALTER TABLE "inbound_records" DROP CONSTRAINT "inbound_records_packageId_fkey";

-- DropForeignKey
ALTER TABLE "logistics_tracking_events" DROP CONSTRAINT "logistics_tracking_events_shipmentId_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_userId_fkey";

-- DropForeignKey
ALTER TABLE "order_status_logs" DROP CONSTRAINT "order_status_logs_orderId_fkey";

-- DropForeignKey
ALTER TABLE "package_images" DROP CONSTRAINT "package_images_packageId_fkey";

-- DropForeignKey
ALTER TABLE "payment_records" DROP CONSTRAINT "payment_records_orderId_fkey";

-- DropForeignKey
ALTER TABLE "qr_codes" DROP CONSTRAINT "qr_codes_orderId_fkey";

-- DropForeignKey
ALTER TABLE "qr_scan_logs" DROP CONSTRAINT "qr_scan_logs_qrCodeId_fkey";

-- DropForeignKey
ALTER TABLE "qr_scan_logs" DROP CONSTRAINT "qr_scan_logs_scanUserId_fkey";

-- DropForeignKey
ALTER TABLE "shipments" DROP CONSTRAINT "shipments_createdByAdminId_fkey";

-- DropForeignKey
ALTER TABLE "shipments" DROP CONSTRAINT "shipments_orderId_fkey";

-- AlterTable
ALTER TABLE "admins" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "exception_cases" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "goods_items" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "inbound_records" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "packages" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "payment_records" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "recommendations" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "shipments" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "warehouse_addresses" ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateTable
CREATE TABLE "admin_accounts" (
    "id" UUID NOT NULL,
    "phone_country_code" VARCHAR(8) NOT NULL DEFAULT '+86',
    "phone_number" VARCHAR(32) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "status" "AdminStatus" NOT NULL DEFAULT 'ACTIVE',
    "display_name" VARCHAR(64),
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL,
    "customer_code" VARCHAR(16) NOT NULL,
    "phone_country_code" VARCHAR(8) NOT NULL DEFAULT '+86',
    "phone_number" VARCHAR(32) NOT NULL,
    "display_name" VARCHAR(64),
    "notes" TEXT,
    "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inbound_packages" (
    "id" UUID NOT NULL,
    "domestic_tracking_no" VARCHAR(64),
    "customer_id" UUID,
    "status" "InboundPackageStatus" NOT NULL DEFAULT 'UNCLAIMED',
    "warehouse_received_at" TIMESTAMP(3),
    "weight_kg" DECIMAL(10,3),
    "length_cm" DECIMAL(10,2),
    "width_cm" DECIMAL(10,2),
    "height_cm" DECIMAL(10,2),
    "volume_cm3" DECIMAL(12,2),
    "label_image_url" TEXT,
    "package_image_urls" JSONB,
    "issue_note" TEXT,
    "admin_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inbound_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_shipments" (
    "id" UUID NOT NULL,
    "shipment_no" VARCHAR(32) NOT NULL,
    "customer_id" UUID NOT NULL,
    "master_shipment_id" UUID,
    "status" "CustomerShipmentStatus" NOT NULL DEFAULT 'DRAFT',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "international_tracking_no" VARCHAR(128),
    "public_tracking_enabled" BOOLEAN NOT NULL DEFAULT true,
    "sent_to_overseas_at" TIMESTAMP(3),
    "arrived_overseas_at" TIMESTAMP(3),
    "local_delivery_requested_at" TIMESTAMP(3),
    "picked_up_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_shipment_items" (
    "id" UUID NOT NULL,
    "customer_shipment_id" UUID NOT NULL,
    "inbound_package_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_shipment_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_shipments" (
    "id" UUID NOT NULL,
    "batch_no" VARCHAR(32) NOT NULL,
    "vendor_name" VARCHAR(64),
    "vendor_tracking_no" VARCHAR(128),
    "status" "MasterShipmentStatus" NOT NULL DEFAULT 'CREATED',
    "public_visible" BOOLEAN NOT NULL DEFAULT false,
    "public_title" VARCHAR(128),
    "public_summary" TEXT,
    "public_status_text" VARCHAR(128),
    "published_at" TIMESTAMP(3),
    "handed_to_vendor_at" TIMESTAMP(3),
    "arrived_overseas_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "admin_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_records" (
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "customer_shipment_id" UUID,
    "type" "TransactionType" NOT NULL DEFAULT 'OTHER',
    "amount_cents" INTEGER NOT NULL,
    "currency" VARCHAR(8) NOT NULL DEFAULT 'USD',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "description" TEXT,
    "admin_note" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_accounts_role_idx" ON "admin_accounts"("role");

-- CreateIndex
CREATE INDEX "admin_accounts_status_idx" ON "admin_accounts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "admin_accounts_phone_unique" ON "admin_accounts"("phone_country_code", "phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "customers_customer_code_key" ON "customers"("customer_code");

-- CreateIndex
CREATE INDEX "customers_customer_code_idx" ON "customers"("customer_code");

-- CreateIndex
CREATE INDEX "customers_phone_number_idx" ON "customers"("phone_number");

-- CreateIndex
CREATE INDEX "customers_status_idx" ON "customers"("status");

-- CreateIndex
CREATE UNIQUE INDEX "customers_phone_unique" ON "customers"("phone_country_code", "phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "inbound_packages_domestic_tracking_no_key" ON "inbound_packages"("domestic_tracking_no");

-- CreateIndex
CREATE INDEX "inbound_packages_customer_id_idx" ON "inbound_packages"("customer_id");

-- CreateIndex
CREATE INDEX "inbound_packages_status_idx" ON "inbound_packages"("status");

-- CreateIndex
CREATE INDEX "inbound_packages_domestic_tracking_no_idx" ON "inbound_packages"("domestic_tracking_no");

-- CreateIndex
CREATE UNIQUE INDEX "customer_shipments_shipment_no_key" ON "customer_shipments"("shipment_no");

-- CreateIndex
CREATE INDEX "customer_shipments_customer_id_idx" ON "customer_shipments"("customer_id");

-- CreateIndex
CREATE INDEX "customer_shipments_master_shipment_id_idx" ON "customer_shipments"("master_shipment_id");

-- CreateIndex
CREATE INDEX "customer_shipments_status_idx" ON "customer_shipments"("status");

-- CreateIndex
CREATE INDEX "customer_shipments_payment_status_idx" ON "customer_shipments"("payment_status");

-- CreateIndex
CREATE INDEX "customer_shipment_items_customer_shipment_id_idx" ON "customer_shipment_items"("customer_shipment_id");

-- CreateIndex
CREATE UNIQUE INDEX "customer_shipment_items_inbound_package_id_key" ON "customer_shipment_items"("inbound_package_id");

-- CreateIndex
CREATE UNIQUE INDEX "customer_shipment_items_customer_shipment_id_inbound_packag_key" ON "customer_shipment_items"("customer_shipment_id", "inbound_package_id");

-- CreateIndex
CREATE UNIQUE INDEX "master_shipments_batch_no_key" ON "master_shipments"("batch_no");

-- CreateIndex
CREATE INDEX "master_shipments_status_idx" ON "master_shipments"("status");

-- CreateIndex
CREATE INDEX "master_shipments_public_visible_idx" ON "master_shipments"("public_visible");

-- CreateIndex
CREATE INDEX "master_shipments_batch_no_idx" ON "master_shipments"("batch_no");

-- CreateIndex
CREATE INDEX "transaction_records_customer_id_idx" ON "transaction_records"("customer_id");

-- CreateIndex
CREATE INDEX "transaction_records_customer_shipment_id_idx" ON "transaction_records"("customer_shipment_id");

-- CreateIndex
CREATE INDEX "transaction_records_payment_status_idx" ON "transaction_records"("payment_status");

-- CreateIndex
CREATE INDEX "transaction_records_occurred_at_idx" ON "transaction_records"("occurred_at");

-- CreateIndex
CREATE INDEX "recommendations_slug_idx" ON "recommendations"("slug");

-- RenameForeignKey
ALTER TABLE "goods_items" RENAME CONSTRAINT "goods_items_packageId_fkey" TO "goods_items_package_id_fkey";

-- RenameForeignKey
ALTER TABLE "orders" RENAME CONSTRAINT "orders_userId_fkey" TO "orders_user_id_fkey";

-- RenameForeignKey
ALTER TABLE "packages" RENAME CONSTRAINT "packages_orderId_fkey" TO "packages_order_id_fkey";

-- AddForeignKey
ALTER TABLE "package_images" ADD CONSTRAINT "package_images_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbound_records" ADD CONSTRAINT "inbound_records_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbound_records" ADD CONSTRAINT "inbound_records_operator_admin_id_fkey" FOREIGN KEY ("operator_admin_id") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_created_by_admin_id_fkey" FOREIGN KEY ("created_by_admin_id") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logistics_tracking_events" ADD CONSTRAINT "logistics_tracking_events_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_scan_logs" ADD CONSTRAINT "qr_scan_logs_qr_code_id_fkey" FOREIGN KEY ("qr_code_id") REFERENCES "qr_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_scan_logs" ADD CONSTRAINT "qr_scan_logs_scan_user_id_fkey" FOREIGN KEY ("scan_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exception_cases" ADD CONSTRAINT "exception_cases_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exception_cases" ADD CONSTRAINT "exception_cases_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_action_logs" ADD CONSTRAINT "admin_action_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_logs" ADD CONSTRAINT "order_status_logs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address_usages" ADD CONSTRAINT "address_usages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbound_packages" ADD CONSTRAINT "inbound_packages_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_shipments" ADD CONSTRAINT "customer_shipments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_shipments" ADD CONSTRAINT "customer_shipments_master_shipment_id_fkey" FOREIGN KEY ("master_shipment_id") REFERENCES "master_shipments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_shipment_items" ADD CONSTRAINT "customer_shipment_items_customer_shipment_id_fkey" FOREIGN KEY ("customer_shipment_id") REFERENCES "customer_shipments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_shipment_items" ADD CONSTRAINT "customer_shipment_items_inbound_package_id_fkey" FOREIGN KEY ("inbound_package_id") REFERENCES "inbound_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_records" ADD CONSTRAINT "transaction_records_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_records" ADD CONSTRAINT "transaction_records_customer_shipment_id_fkey" FOREIGN KEY ("customer_shipment_id") REFERENCES "customer_shipments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "address_usages_copiedAt_idx" RENAME TO "address_usages_copied_at_idx";

-- RenameIndex
ALTER INDEX "address_usages_userId_idx" RENAME TO "address_usages_user_id_idx";

-- RenameIndex
ALTER INDEX "admin_action_logs_adminId_idx" RENAME TO "admin_action_logs_admin_id_idx";

-- RenameIndex
ALTER INDEX "admin_action_logs_createdAt_idx" RENAME TO "admin_action_logs_created_at_idx";

-- RenameIndex
ALTER INDEX "admin_action_logs_targetType_targetId_idx" RENAME TO "admin_action_logs_target_type_target_id_idx";

-- RenameIndex
ALTER INDEX "admins_isActive_idx" RENAME TO "admins_is_active_idx";

-- RenameIndex
ALTER INDEX "exception_cases_createdAt_idx" RENAME TO "exception_cases_created_at_idx";

-- RenameIndex
ALTER INDEX "exception_cases_orderId_idx" RENAME TO "exception_cases_order_id_idx";

-- RenameIndex
ALTER INDEX "exception_cases_packageId_idx" RENAME TO "exception_cases_package_id_idx";

-- RenameIndex
ALTER INDEX "goods_items_packageId_idx" RENAME TO "goods_items_package_id_idx";

-- RenameIndex
ALTER INDEX "inbound_records_inboundTime_idx" RENAME TO "inbound_records_inbound_time_idx";

-- RenameIndex
ALTER INDEX "inbound_records_operatorAdminId_idx" RENAME TO "inbound_records_operator_admin_id_idx";

-- RenameIndex
ALTER INDEX "inbound_records_packageId_idx" RENAME TO "inbound_records_package_id_idx";

-- RenameIndex
ALTER INDEX "logistics_tracking_events_eventTime_idx" RENAME TO "logistics_tracking_events_event_time_idx";

-- RenameIndex
ALTER INDEX "logistics_tracking_events_shipmentId_idx" RENAME TO "logistics_tracking_events_shipment_id_idx";

-- RenameIndex
ALTER INDEX "notifications_createdAt_idx" RENAME TO "notifications_created_at_idx";

-- RenameIndex
ALTER INDEX "notifications_isRead_idx" RENAME TO "notifications_is_read_idx";

-- RenameIndex
ALTER INDEX "notifications_userId_idx" RENAME TO "notifications_user_id_idx";

-- RenameIndex
ALTER INDEX "order_status_logs_createdAt_idx" RENAME TO "order_status_logs_created_at_idx";

-- RenameIndex
ALTER INDEX "order_status_logs_orderId_idx" RENAME TO "order_status_logs_order_id_idx";

-- RenameIndex
ALTER INDEX "order_status_logs_toStatus_idx" RENAME TO "order_status_logs_to_status_idx";

-- RenameIndex
ALTER INDEX "orders_createdAt_idx" RENAME TO "orders_created_at_idx";

-- RenameIndex
ALTER INDEX "orders_orderNo_idx" RENAME TO "orders_order_no_idx";

-- RenameIndex
ALTER INDEX "orders_orderNo_key" RENAME TO "orders_order_no_key";

-- RenameIndex
ALTER INDEX "orders_paymentStatus_idx" RENAME TO "orders_payment_status_idx";

-- RenameIndex
ALTER INDEX "orders_userId_idx" RENAME TO "orders_user_id_idx";

-- RenameIndex
ALTER INDEX "package_images_imageType_idx" RENAME TO "package_images_image_type_idx";

-- RenameIndex
ALTER INDEX "package_images_packageId_idx" RENAME TO "package_images_package_id_idx";

-- RenameIndex
ALTER INDEX "package_images_storagePath_idx" RENAME TO "package_images_storage_path_idx";

-- RenameIndex
ALTER INDEX "packages_domesticTrackingNo_idx" RENAME TO "packages_domestic_tracking_no_idx";

-- RenameIndex
ALTER INDEX "packages_inboundAt_idx" RENAME TO "packages_inbound_at_idx";

-- RenameIndex
ALTER INDEX "packages_orderId_idx" RENAME TO "packages_order_id_idx";

-- RenameIndex
ALTER INDEX "packages_packageNo_idx" RENAME TO "packages_package_no_idx";

-- RenameIndex
ALTER INDEX "packages_packageNo_key" RENAME TO "packages_package_no_key";

-- RenameIndex
ALTER INDEX "payment_records_confirmedAt_idx" RENAME TO "payment_records_confirmed_at_idx";

-- RenameIndex
ALTER INDEX "payment_records_orderId_idx" RENAME TO "payment_records_order_id_idx";

-- RenameIndex
ALTER INDEX "payment_records_paymentStatus_idx" RENAME TO "payment_records_payment_status_idx";

-- RenameIndex
ALTER INDEX "qr_codes_expiresAt_idx" RENAME TO "qr_codes_expires_at_idx";

-- RenameIndex
ALTER INDEX "qr_codes_orderId_idx" RENAME TO "qr_codes_order_id_idx";

-- RenameIndex
ALTER INDEX "qr_codes_tokenHash_idx" RENAME TO "qr_codes_token_hash_idx";

-- RenameIndex
ALTER INDEX "qr_scan_logs_qrCodeId_idx" RENAME TO "qr_scan_logs_qr_code_id_idx";

-- RenameIndex
ALTER INDEX "qr_scan_logs_scanUserId_idx" RENAME TO "qr_scan_logs_scan_user_id_idx";

-- RenameIndex
ALTER INDEX "qr_scan_logs_scannedAt_idx" RENAME TO "qr_scan_logs_scanned_at_idx";

-- RenameIndex
ALTER INDEX "recommendations_publishedAt_idx" RENAME TO "recommendations_published_at_idx";

-- RenameIndex
ALTER INDEX "shipments_orderId_key" RENAME TO "shipments_order_id_key";

-- RenameIndex
ALTER INDEX "shipments_shippedAt_idx" RENAME TO "shipments_shipped_at_idx";

-- RenameIndex
ALTER INDEX "shipments_trackingNumber_idx" RENAME TO "shipments_tracking_number_idx";

-- RenameIndex
ALTER INDEX "users_createdAt_idx" RENAME TO "users_created_at_idx";

-- RenameIndex
ALTER INDEX "users_userCode_idx" RENAME TO "users_user_code_idx";

-- RenameIndex
ALTER INDEX "users_userCode_key" RENAME TO "users_user_code_key";

-- RenameIndex
ALTER INDEX "warehouse_addresses_isActive_idx" RENAME TO "warehouse_addresses_is_active_idx";
