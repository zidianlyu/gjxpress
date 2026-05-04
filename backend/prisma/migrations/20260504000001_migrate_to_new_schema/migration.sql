-- ============================================================
-- Migration: old snake_case schema to new camelCase schema
-- Strategy: backup users, drop all old tables+enums with CASCADE,
--           recreate everything from scratch with new schema
-- ============================================================

-- Step 1: Backup users data (temp table persists for session)
CREATE TEMP TABLE _users_backup AS SELECT * FROM "users";

-- Step 2: Drop ALL old tables with CASCADE (removes all FKs + enum deps)
DROP TABLE IF EXISTS "admin_logs"      CASCADE;
DROP TABLE IF EXISTS "exceptions"      CASCADE;
DROP TABLE IF EXISTS "qr_tokens"       CASCADE;
DROP TABLE IF EXISTS "notifications"   CASCADE;
DROP TABLE IF EXISTS "inbound_records" CASCADE;
DROP TABLE IF EXISTS "package_images"  CASCADE;
DROP TABLE IF EXISTS "goods_items"     CASCADE;
DROP TABLE IF EXISTS "shipments"       CASCADE;
DROP TABLE IF EXISTS "packages"        CASCADE;
DROP TABLE IF EXISTS "orders"          CASCADE;
DROP TABLE IF EXISTS "users"           CASCADE;

-- Step 3: Drop ALL old enum types
DROP TYPE IF EXISTS "OrderStatus"         CASCADE;
DROP TYPE IF EXISTS "PackageStatus"       CASCADE;
DROP TYPE IF EXISTS "PaymentStatus"       CASCADE;
DROP TYPE IF EXISTS "ImageType"           CASCADE;
DROP TYPE IF EXISTS "ExceptionType"       CASCADE;
DROP TYPE IF EXISTS "ExceptionStatus"     CASCADE;
DROP TYPE IF EXISTS "AdminAction"         CASCADE;
DROP TYPE IF EXISTS "NotificationTrigger" CASCADE;

-- Step 4: Create all new enum types
CREATE TYPE "UserRole" AS ENUM ('USER','ADMIN','SUPER_ADMIN');
CREATE TYPE "OrderStatus" AS ENUM ('UNINBOUND','INBOUNDED','USER_CONFIRM_PENDING','REVIEW_PENDING','PAYMENT_PENDING','PAID','READY_TO_SHIP','SHIPPED','COMPLETED','EXCEPTION','CANCELLED');
CREATE TYPE "PackageStatus" AS ENUM ('CREATED','INBOUNDED','USER_CONFIRM_PENDING','CONFIRMED','EXCEPTION','CONSOLIDATED','SHIPPED','COMPLETED','CANCELLED');
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID','PROCESSING','PAID','REFUNDED','WAIVED');
CREATE TYPE "SourcePlatform" AS ENUM ('TAOBAO','JD','PINDUODUO','OTHER');
CREATE TYPE "ImageType" AS ENUM ('OUTER','LABEL','INNER','EXCEPTION','PAYMENT_PROOF','OTHER');
CREATE TYPE "ImageStatus" AS ENUM ('CREATED','UPLOADED','DELETED');
CREATE TYPE "ExceptionType" AS ENUM ('MISSING_ITEM','WRONG_ITEM','DAMAGED','RESTRICTED','OTHER');
CREATE TYPE "ExceptionStatus" AS ENUM ('OPEN','PROCESSING','RESOLVED','CANCELLED');
CREATE TYPE "ShipmentProvider" AS ENUM ('UPS','DHL','EMS','USPS','FEDEX','SEA','AIR','OTHER');
CREATE TYPE "ShipmentStatus" AS ENUM ('CREATED','READY','SHIPPED','IN_TRANSIT','DELIVERED','EXCEPTION','CANCELLED');
CREATE TYPE "QrPurpose" AS ENUM ('RECEIPT_CONFIRMATION','PICKUP_CONFIRMATION');
CREATE TYPE "AdminActionTargetType" AS ENUM ('ORDER','PACKAGE','PAYMENT','SHIPMENT','EXCEPTION','IMAGE','USER','ADMIN','SYSTEM');
CREATE TYPE "RecommendationStatus" AS ENUM ('DRAFT','PUBLISHED','ARCHIVED');

-- Step 5: Create "users"
CREATE TABLE "users" (
  "id"        TEXT NOT NULL,
  "openid"    TEXT NOT NULL,
  "unionid"   TEXT,
  "nickname"  TEXT,
  "avatarUrl" TEXT,
  "userCode"  TEXT NOT NULL,
  "role"      "UserRole" NOT NULL DEFAULT 'USER',
  "isActive"  BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_openid_key"   ON "users"("openid");
CREATE UNIQUE INDEX "users_userCode_key" ON "users"("userCode");
CREATE INDEX "users_userCode_idx"  ON "users"("userCode");
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- Restore users from backup
INSERT INTO "users" ("id","openid","nickname","avatarUrl","userCode","role","isActive","createdAt","updatedAt")
SELECT
  b.id,
  b.openid,
  b.nickname,
  b.avatar,
  CASE WHEN b.user_code IS NULL OR trim(b.user_code) = ''
       THEN 'U' || upper(substr(md5(b.id), 1, 4))
       ELSE b.user_code END,
  CASE WHEN b.is_admin = true THEN 'ADMIN'::"UserRole" ELSE 'USER'::"UserRole" END,
  true,
  COALESCE(b.created_at, CURRENT_TIMESTAMP),
  CURRENT_TIMESTAMP
FROM _users_backup b
ON CONFLICT ("openid") DO NOTHING;

-- Step 6: Create "admins"
CREATE TABLE "admins" (
  "id"           TEXT NOT NULL,
  "username"     TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "displayName"  TEXT,
  "role"         "UserRole" NOT NULL DEFAULT 'ADMIN',
  "isActive"     BOOLEAN NOT NULL DEFAULT true,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");
CREATE INDEX "admins_role_idx"     ON "admins"("role");
CREATE INDEX "admins_isActive_idx" ON "admins"("isActive");

-- Step 7: Create "orders"
CREATE TABLE "orders" (
  "id"                TEXT NOT NULL,
  "orderNo"           TEXT NOT NULL,
  "userId"            TEXT NOT NULL,
  "status"            "OrderStatus" NOT NULL DEFAULT 'UNINBOUND',
  "paymentStatus"     "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
  "totalActualWeight" DECIMAL(10,2),
  "totalVolumeWeight" DECIMAL(10,2),
  "chargeableWeight"  DECIMAL(10,2),
  "estimatedPrice"    DECIMAL(10,2),
  "finalPrice"        DECIMAL(10,2),
  "currency"          TEXT NOT NULL DEFAULT 'USD',
  "manualOverride"    BOOLEAN NOT NULL DEFAULT false,
  "adminRemark"       TEXT,
  "userRemark"        TEXT,
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "orders_orderNo_key"    ON "orders"("orderNo");
CREATE INDEX "orders_userId_idx"            ON "orders"("userId");
CREATE INDEX "orders_orderNo_idx"           ON "orders"("orderNo");
CREATE INDEX "orders_status_idx"            ON "orders"("status");
CREATE INDEX "orders_paymentStatus_idx"     ON "orders"("paymentStatus");
CREATE INDEX "orders_createdAt_idx"         ON "orders"("createdAt");
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 8: Create "packages"
CREATE TABLE "packages" (
  "id"                 TEXT NOT NULL,
  "packageNo"          TEXT NOT NULL,
  "orderId"            TEXT NOT NULL,
  "domesticTrackingNo" TEXT,
  "sourcePlatform"     "SourcePlatform" NOT NULL DEFAULT 'OTHER',
  "status"             "PackageStatus" NOT NULL DEFAULT 'CREATED',
  "actualWeight"       DECIMAL(10,2),
  "lengthCm"           DECIMAL(10,2),
  "widthCm"            DECIMAL(10,2),
  "heightCm"           DECIMAL(10,2),
  "volumeWeight"       DECIMAL(10,2),
  "inboundAt"          TIMESTAMP(3),
  "userConfirmedAt"    TIMESTAMP(3),
  "remark"             TEXT,
  "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "packages_packageNo_key"   ON "packages"("packageNo");
CREATE INDEX "packages_orderId_idx"            ON "packages"("orderId");
CREATE INDEX "packages_packageNo_idx"          ON "packages"("packageNo");
CREATE INDEX "packages_domesticTrackingNo_idx" ON "packages"("domesticTrackingNo");
CREATE INDEX "packages_status_idx"             ON "packages"("status");
CREATE INDEX "packages_inboundAt_idx"          ON "packages"("inboundAt");
ALTER TABLE "packages" ADD CONSTRAINT "packages_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 9: Create "goods_items"
CREATE TABLE "goods_items" (
  "id"                    TEXT NOT NULL,
  "packageId"             TEXT NOT NULL,
  "name"                  TEXT,
  "category"              TEXT,
  "quantity"              INTEGER NOT NULL DEFAULT 1,
  "containsSensitiveItem" BOOLEAN NOT NULL DEFAULT false,
  "remark"                TEXT,
  "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "goods_items_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "goods_items_packageId_idx" ON "goods_items"("packageId");
CREATE INDEX "goods_items_category_idx"  ON "goods_items"("category");
ALTER TABLE "goods_items" ADD CONSTRAINT "goods_items_packageId_fkey"
  FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 10: Create "package_images"
CREATE TABLE "package_images" (
  "id"                TEXT NOT NULL,
  "packageId"         TEXT,
  "imageType"         "ImageType" NOT NULL,
  "status"            "ImageStatus" NOT NULL DEFAULT 'CREATED',
  "bucket"            TEXT NOT NULL,
  "storagePath"       TEXT NOT NULL,
  "publicUrl"         TEXT,
  "mimeType"          TEXT,
  "sizeBytes"         INTEGER,
  "checksum"          TEXT,
  "uploadedByUserId"  TEXT,
  "uploadedByAdminId" TEXT,
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "uploadedAt"        TIMESTAMP(3),
  "deletedAt"         TIMESTAMP(3),
  CONSTRAINT "package_images_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "package_images_packageId_idx"   ON "package_images"("packageId");
CREATE INDEX "package_images_imageType_idx"   ON "package_images"("imageType");
CREATE INDEX "package_images_status_idx"      ON "package_images"("status");
CREATE INDEX "package_images_storagePath_idx" ON "package_images"("storagePath");
ALTER TABLE "package_images" ADD CONSTRAINT "package_images_packageId_fkey"
  FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE SET NULL;

-- Step 11: Create "inbound_records"
CREATE TABLE "inbound_records" (
  "id"              TEXT NOT NULL,
  "packageId"       TEXT NOT NULL,
  "operatorAdminId" TEXT NOT NULL,
  "checkResult"     TEXT,
  "remark"          TEXT,
  "inboundTime"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "inbound_records_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "inbound_records_packageId_idx"       ON "inbound_records"("packageId");
CREATE INDEX "inbound_records_operatorAdminId_idx" ON "inbound_records"("operatorAdminId");
CREATE INDEX "inbound_records_inboundTime_idx"     ON "inbound_records"("inboundTime");
ALTER TABLE "inbound_records" ADD CONSTRAINT "inbound_records_packageId_fkey"
  FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE CASCADE;
ALTER TABLE "inbound_records" ADD CONSTRAINT "inbound_records_operatorAdminId_fkey"
  FOREIGN KEY ("operatorAdminId") REFERENCES "admins"("id");

-- Step 12: Create "payment_records"
CREATE TABLE "payment_records" (
  "id"                 TEXT NOT NULL,
  "orderId"            TEXT NOT NULL,
  "paymentStatus"      "PaymentStatus" NOT NULL,
  "paymentMethod"      TEXT,
  "amount"             DECIMAL(10,2),
  "currency"           TEXT NOT NULL DEFAULT 'USD',
  "proofImageId"       TEXT,
  "remark"             TEXT,
  "confirmedByAdminId" TEXT,
  "confirmedAt"        TIMESTAMP(3),
  "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "payment_records_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "payment_records_orderId_idx"       ON "payment_records"("orderId");
CREATE INDEX "payment_records_paymentStatus_idx" ON "payment_records"("paymentStatus");
CREATE INDEX "payment_records_confirmedAt_idx"   ON "payment_records"("confirmedAt");
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE;

-- Step 13: Create "shipments"
CREATE TABLE "shipments" (
  "id"                 TEXT NOT NULL,
  "orderId"            TEXT NOT NULL,
  "provider"           "ShipmentProvider" NOT NULL,
  "trackingNumber"     TEXT,
  "status"             "ShipmentStatus" NOT NULL DEFAULT 'CREATED',
  "shippedAt"          TIMESTAMP(3),
  "estimatedArrivalAt" TIMESTAMP(3),
  "rawPayload"         JSONB,
  "createdByAdminId"   TEXT,
  "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "shipments_orderId_key"   ON "shipments"("orderId");
CREATE INDEX "shipments_provider_idx"         ON "shipments"("provider");
CREATE INDEX "shipments_trackingNumber_idx"   ON "shipments"("trackingNumber");
CREATE INDEX "shipments_status_idx"           ON "shipments"("status");
CREATE INDEX "shipments_shippedAt_idx"        ON "shipments"("shippedAt");
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE;
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_createdByAdminId_fkey"
  FOREIGN KEY ("createdByAdminId") REFERENCES "admins"("id");

-- Step 14: Create "logistics_tracking_events"
CREATE TABLE "logistics_tracking_events" (
  "id"            TEXT NOT NULL,
  "shipmentId"    TEXT NOT NULL,
  "eventStatus"   TEXT,
  "eventLocation" TEXT,
  "description"   TEXT,
  "eventTime"     TIMESTAMP(3),
  "rawPayload"    JSONB,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "logistics_tracking_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "logistics_tracking_events_shipmentId_idx" ON "logistics_tracking_events"("shipmentId");
CREATE INDEX "logistics_tracking_events_eventTime_idx"  ON "logistics_tracking_events"("eventTime");
ALTER TABLE "logistics_tracking_events" ADD CONSTRAINT "logistics_tracking_events_shipmentId_fkey"
  FOREIGN KEY ("shipmentId") REFERENCES "shipments"("id") ON DELETE CASCADE;

-- Step 15: Create "qr_codes"
CREATE TABLE "qr_codes" (
  "id"        TEXT NOT NULL,
  "orderId"   TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "purpose"   "QrPurpose" NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "isUsed"    BOOLEAN NOT NULL DEFAULT false,
  "usedAt"    TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "qr_codes_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "qr_codes_orderId_idx"   ON "qr_codes"("orderId");
CREATE INDEX "qr_codes_tokenHash_idx" ON "qr_codes"("tokenHash");
CREATE INDEX "qr_codes_expiresAt_idx" ON "qr_codes"("expiresAt");
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE;

-- Step 16: Create "qr_scan_logs"
CREATE TABLE "qr_scan_logs" (
  "id"           TEXT NOT NULL,
  "qrCodeId"     TEXT NOT NULL,
  "scanUserId"   TEXT,
  "isAuthorized" BOOLEAN NOT NULL,
  "result"       TEXT,
  "ipAddress"    TEXT,
  "userAgent"    TEXT,
  "scannedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "qr_scan_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "qr_scan_logs_qrCodeId_idx"   ON "qr_scan_logs"("qrCodeId");
CREATE INDEX "qr_scan_logs_scanUserId_idx" ON "qr_scan_logs"("scanUserId");
CREATE INDEX "qr_scan_logs_scannedAt_idx"  ON "qr_scan_logs"("scannedAt");
ALTER TABLE "qr_scan_logs" ADD CONSTRAINT "qr_scan_logs_qrCodeId_fkey"
  FOREIGN KEY ("qrCodeId") REFERENCES "qr_codes"("id") ON DELETE CASCADE;
ALTER TABLE "qr_scan_logs" ADD CONSTRAINT "qr_scan_logs_scanUserId_fkey"
  FOREIGN KEY ("scanUserId") REFERENCES "users"("id");

-- Step 17: Create "exception_cases"
CREATE TABLE "exception_cases" (
  "id"               TEXT NOT NULL,
  "orderId"          TEXT NOT NULL,
  "packageId"        TEXT,
  "type"             "ExceptionType" NOT NULL,
  "status"           "ExceptionStatus" NOT NULL DEFAULT 'OPEN',
  "description"      TEXT,
  "resolution"       TEXT,
  "createdByUserId"  TEXT,
  "createdByAdminId" TEXT,
  "resolvedAt"       TIMESTAMP(3),
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "exception_cases_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "exception_cases_orderId_idx"   ON "exception_cases"("orderId");
CREATE INDEX "exception_cases_packageId_idx" ON "exception_cases"("packageId");
CREATE INDEX "exception_cases_type_idx"      ON "exception_cases"("type");
CREATE INDEX "exception_cases_status_idx"    ON "exception_cases"("status");
CREATE INDEX "exception_cases_createdAt_idx" ON "exception_cases"("createdAt");
ALTER TABLE "exception_cases" ADD CONSTRAINT "exception_cases_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE;
ALTER TABLE "exception_cases" ADD CONSTRAINT "exception_cases_packageId_fkey"
  FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE SET NULL;

-- Step 18: Create "admin_action_logs"
CREATE TABLE "admin_action_logs" (
  "id"          TEXT NOT NULL,
  "adminId"     TEXT NOT NULL,
  "targetType"  "AdminActionTargetType" NOT NULL,
  "targetId"    TEXT NOT NULL,
  "action"      TEXT NOT NULL,
  "beforeState" JSONB,
  "afterState"  JSONB,
  "reason"      TEXT,
  "ipAddress"   TEXT,
  "userAgent"   TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_action_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "admin_action_logs_adminId_idx"             ON "admin_action_logs"("adminId");
CREATE INDEX "admin_action_logs_targetType_targetId_idx" ON "admin_action_logs"("targetType","targetId");
CREATE INDEX "admin_action_logs_action_idx"              ON "admin_action_logs"("action");
CREATE INDEX "admin_action_logs_createdAt_idx"           ON "admin_action_logs"("createdAt");
ALTER TABLE "admin_action_logs" ADD CONSTRAINT "admin_action_logs_adminId_fkey"
  FOREIGN KEY ("adminId") REFERENCES "admins"("id");

-- Step 19: Create "order_status_logs"
CREATE TABLE "order_status_logs" (
  "id"            TEXT NOT NULL,
  "orderId"       TEXT NOT NULL,
  "fromStatus"    "OrderStatus",
  "toStatus"      "OrderStatus" NOT NULL,
  "changedByType" TEXT NOT NULL,
  "changedById"   TEXT,
  "reason"        TEXT,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "order_status_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "order_status_logs_orderId_idx"   ON "order_status_logs"("orderId");
CREATE INDEX "order_status_logs_toStatus_idx"  ON "order_status_logs"("toStatus");
CREATE INDEX "order_status_logs_createdAt_idx" ON "order_status_logs"("createdAt");
ALTER TABLE "order_status_logs" ADD CONSTRAINT "order_status_logs_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE;

-- Step 20: Create "notifications"
CREATE TABLE "notifications" (
  "id"        TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "type"      TEXT NOT NULL,
  "title"     TEXT,
  "body"      TEXT,
  "payload"   JSONB,
  "isRead"    BOOLEAN NOT NULL DEFAULT false,
  "sentAt"    TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "notifications_userId_idx"    ON "notifications"("userId");
CREATE INDEX "notifications_type_idx"      ON "notifications"("type");
CREATE INDEX "notifications_isRead_idx"    ON "notifications"("isRead");
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

-- Step 21: Create "address_usages"
CREATE TABLE "address_usages" (
  "id"                 TEXT NOT NULL,
  "userId"             TEXT NOT NULL,
  "warehouseAddressId" TEXT,
  "copiedAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "address_usages_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "address_usages_userId_idx"   ON "address_usages"("userId");
CREATE INDEX "address_usages_copiedAt_idx" ON "address_usages"("copiedAt");
ALTER TABLE "address_usages" ADD CONSTRAINT "address_usages_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

-- Step 22: Create "warehouse_addresses"
CREATE TABLE "warehouse_addresses" (
  "id"           TEXT NOT NULL,
  "name"         TEXT NOT NULL,
  "receiverName" TEXT NOT NULL,
  "phone"        TEXT NOT NULL,
  "country"      TEXT NOT NULL DEFAULT '中国',
  "province"     TEXT NOT NULL,
  "city"         TEXT NOT NULL,
  "district"     TEXT,
  "addressLine"  TEXT NOT NULL,
  "postalCode"   TEXT,
  "isActive"     BOOLEAN NOT NULL DEFAULT true,
  "remark"       TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "warehouse_addresses_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "warehouse_addresses_isActive_idx" ON "warehouse_addresses"("isActive");

-- Step 23: Create "recommendations"
CREATE TABLE "recommendations" (
  "id"             TEXT NOT NULL,
  "slug"           TEXT NOT NULL,
  "title"          TEXT NOT NULL,
  "summary"        TEXT,
  "body"           TEXT,
  "category"       TEXT,
  "city"           TEXT,
  "tags"           TEXT[] NOT NULL DEFAULT '{}',
  "status"         "RecommendationStatus" NOT NULL DEFAULT 'DRAFT',
  "seoTitle"       TEXT,
  "seoDescription" TEXT,
  "publishedAt"    TIMESTAMP(3),
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "recommendations_slug_key" ON "recommendations"("slug");
CREATE INDEX "recommendations_status_idx"      ON "recommendations"("status");
CREATE INDEX "recommendations_category_idx"    ON "recommendations"("category");
CREATE INDEX "recommendations_city_idx"        ON "recommendations"("city");
CREATE INDEX "recommendations_publishedAt_idx" ON "recommendations"("publishedAt");

-- Step 24: Drop temp table
DROP TABLE IF EXISTS _users_backup;
