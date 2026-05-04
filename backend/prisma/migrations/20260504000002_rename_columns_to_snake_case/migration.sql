-- ============================================================
-- Migration: rename all camelCase DB columns to snake_case
-- No data loss. No DROP. Pure RENAME COLUMN.
-- schema.prisma will use @map to bridge camelCase ↔ snake_case
-- ============================================================

-- ─── users ───────────────────────────────────────────────────
ALTER TABLE "users" RENAME COLUMN "avatarUrl"  TO "avatar_url";
ALTER TABLE "users" RENAME COLUMN "userCode"   TO "user_code";
ALTER TABLE "users" RENAME COLUMN "isActive"   TO "is_active";
ALTER TABLE "users" RENAME COLUMN "createdAt"  TO "created_at";
ALTER TABLE "users" RENAME COLUMN "updatedAt"  TO "updated_at";

-- ─── admins ──────────────────────────────────────────────────
ALTER TABLE "admins" RENAME COLUMN "passwordHash"  TO "password_hash";
ALTER TABLE "admins" RENAME COLUMN "displayName"   TO "display_name";
ALTER TABLE "admins" RENAME COLUMN "isActive"      TO "is_active";
ALTER TABLE "admins" RENAME COLUMN "createdAt"     TO "created_at";
ALTER TABLE "admins" RENAME COLUMN "updatedAt"     TO "updated_at";

-- ─── orders ──────────────────────────────────────────────────
ALTER TABLE "orders" RENAME COLUMN "orderNo"           TO "order_no";
ALTER TABLE "orders" RENAME COLUMN "userId"            TO "user_id";
ALTER TABLE "orders" RENAME COLUMN "paymentStatus"     TO "payment_status";
ALTER TABLE "orders" RENAME COLUMN "totalActualWeight" TO "total_actual_weight";
ALTER TABLE "orders" RENAME COLUMN "totalVolumeWeight" TO "total_volume_weight";
ALTER TABLE "orders" RENAME COLUMN "chargeableWeight"  TO "chargeable_weight";
ALTER TABLE "orders" RENAME COLUMN "estimatedPrice"    TO "estimated_price";
ALTER TABLE "orders" RENAME COLUMN "finalPrice"        TO "final_price";
ALTER TABLE "orders" RENAME COLUMN "manualOverride"    TO "manual_override";
ALTER TABLE "orders" RENAME COLUMN "adminRemark"       TO "admin_remark";
ALTER TABLE "orders" RENAME COLUMN "userRemark"        TO "user_remark";
ALTER TABLE "orders" RENAME COLUMN "createdAt"         TO "created_at";
ALTER TABLE "orders" RENAME COLUMN "updatedAt"         TO "updated_at";

-- ─── packages ────────────────────────────────────────────────
ALTER TABLE "packages" RENAME COLUMN "packageNo"          TO "package_no";
ALTER TABLE "packages" RENAME COLUMN "orderId"            TO "order_id";
ALTER TABLE "packages" RENAME COLUMN "domesticTrackingNo" TO "domestic_tracking_no";
ALTER TABLE "packages" RENAME COLUMN "sourcePlatform"     TO "source_platform";
ALTER TABLE "packages" RENAME COLUMN "actualWeight"       TO "actual_weight";
ALTER TABLE "packages" RENAME COLUMN "lengthCm"           TO "length_cm";
ALTER TABLE "packages" RENAME COLUMN "widthCm"            TO "width_cm";
ALTER TABLE "packages" RENAME COLUMN "heightCm"           TO "height_cm";
ALTER TABLE "packages" RENAME COLUMN "volumeWeight"       TO "volume_weight";
ALTER TABLE "packages" RENAME COLUMN "inboundAt"          TO "inbound_at";
ALTER TABLE "packages" RENAME COLUMN "userConfirmedAt"    TO "user_confirmed_at";
ALTER TABLE "packages" RENAME COLUMN "createdAt"          TO "created_at";
ALTER TABLE "packages" RENAME COLUMN "updatedAt"          TO "updated_at";

-- ─── goods_items ─────────────────────────────────────────────
ALTER TABLE "goods_items" RENAME COLUMN "packageId"             TO "package_id";
ALTER TABLE "goods_items" RENAME COLUMN "containsSensitiveItem" TO "contains_sensitive_item";
ALTER TABLE "goods_items" RENAME COLUMN "createdAt"             TO "created_at";
ALTER TABLE "goods_items" RENAME COLUMN "updatedAt"             TO "updated_at";

-- ─── package_images ──────────────────────────────────────────
ALTER TABLE "package_images" RENAME COLUMN "packageId"          TO "package_id";
ALTER TABLE "package_images" RENAME COLUMN "imageType"          TO "image_type";
ALTER TABLE "package_images" RENAME COLUMN "storagePath"        TO "storage_path";
ALTER TABLE "package_images" RENAME COLUMN "publicUrl"          TO "public_url";
ALTER TABLE "package_images" RENAME COLUMN "mimeType"           TO "mime_type";
ALTER TABLE "package_images" RENAME COLUMN "sizeBytes"          TO "size_bytes";
ALTER TABLE "package_images" RENAME COLUMN "uploadedByUserId"   TO "uploaded_by_user_id";
ALTER TABLE "package_images" RENAME COLUMN "uploadedByAdminId"  TO "uploaded_by_admin_id";
ALTER TABLE "package_images" RENAME COLUMN "createdAt"          TO "created_at";
ALTER TABLE "package_images" RENAME COLUMN "uploadedAt"         TO "uploaded_at";
ALTER TABLE "package_images" RENAME COLUMN "deletedAt"          TO "deleted_at";

-- ─── inbound_records ─────────────────────────────────────────
ALTER TABLE "inbound_records" RENAME COLUMN "packageId"       TO "package_id";
ALTER TABLE "inbound_records" RENAME COLUMN "operatorAdminId" TO "operator_admin_id";
ALTER TABLE "inbound_records" RENAME COLUMN "checkResult"     TO "check_result";
ALTER TABLE "inbound_records" RENAME COLUMN "inboundTime"     TO "inbound_time";
ALTER TABLE "inbound_records" RENAME COLUMN "createdAt"       TO "created_at";
ALTER TABLE "inbound_records" RENAME COLUMN "updatedAt"       TO "updated_at";

-- ─── payment_records ─────────────────────────────────────────
ALTER TABLE "payment_records" RENAME COLUMN "orderId"             TO "order_id";
ALTER TABLE "payment_records" RENAME COLUMN "paymentStatus"       TO "payment_status";
ALTER TABLE "payment_records" RENAME COLUMN "paymentMethod"       TO "payment_method";
ALTER TABLE "payment_records" RENAME COLUMN "proofImageId"        TO "proof_image_id";
ALTER TABLE "payment_records" RENAME COLUMN "confirmedByAdminId"  TO "confirmed_by_admin_id";
ALTER TABLE "payment_records" RENAME COLUMN "confirmedAt"         TO "confirmed_at";
ALTER TABLE "payment_records" RENAME COLUMN "createdAt"           TO "created_at";
ALTER TABLE "payment_records" RENAME COLUMN "updatedAt"           TO "updated_at";

-- ─── shipments ───────────────────────────────────────────────
ALTER TABLE "shipments" RENAME COLUMN "orderId"             TO "order_id";
ALTER TABLE "shipments" RENAME COLUMN "trackingNumber"      TO "tracking_number";
ALTER TABLE "shipments" RENAME COLUMN "shippedAt"           TO "shipped_at";
ALTER TABLE "shipments" RENAME COLUMN "estimatedArrivalAt"  TO "estimated_arrival_at";
ALTER TABLE "shipments" RENAME COLUMN "rawPayload"          TO "raw_payload";
ALTER TABLE "shipments" RENAME COLUMN "createdByAdminId"    TO "created_by_admin_id";
ALTER TABLE "shipments" RENAME COLUMN "createdAt"           TO "created_at";
ALTER TABLE "shipments" RENAME COLUMN "updatedAt"           TO "updated_at";

-- ─── logistics_tracking_events ───────────────────────────────
ALTER TABLE "logistics_tracking_events" RENAME COLUMN "shipmentId"    TO "shipment_id";
ALTER TABLE "logistics_tracking_events" RENAME COLUMN "eventStatus"   TO "event_status";
ALTER TABLE "logistics_tracking_events" RENAME COLUMN "eventLocation" TO "event_location";
ALTER TABLE "logistics_tracking_events" RENAME COLUMN "eventTime"     TO "event_time";
ALTER TABLE "logistics_tracking_events" RENAME COLUMN "rawPayload"    TO "raw_payload";
ALTER TABLE "logistics_tracking_events" RENAME COLUMN "createdAt"     TO "created_at";

-- ─── qr_codes ────────────────────────────────────────────────
ALTER TABLE "qr_codes" RENAME COLUMN "orderId"    TO "order_id";
ALTER TABLE "qr_codes" RENAME COLUMN "tokenHash"  TO "token_hash";
ALTER TABLE "qr_codes" RENAME COLUMN "expiresAt"  TO "expires_at";
ALTER TABLE "qr_codes" RENAME COLUMN "isUsed"     TO "is_used";
ALTER TABLE "qr_codes" RENAME COLUMN "usedAt"     TO "used_at";
ALTER TABLE "qr_codes" RENAME COLUMN "createdAt"  TO "created_at";

-- ─── qr_scan_logs ────────────────────────────────────────────
ALTER TABLE "qr_scan_logs" RENAME COLUMN "qrCodeId"     TO "qr_code_id";
ALTER TABLE "qr_scan_logs" RENAME COLUMN "scanUserId"   TO "scan_user_id";
ALTER TABLE "qr_scan_logs" RENAME COLUMN "isAuthorized" TO "is_authorized";
ALTER TABLE "qr_scan_logs" RENAME COLUMN "ipAddress"    TO "ip_address";
ALTER TABLE "qr_scan_logs" RENAME COLUMN "userAgent"    TO "user_agent";
ALTER TABLE "qr_scan_logs" RENAME COLUMN "scannedAt"    TO "scanned_at";

-- ─── exception_cases ─────────────────────────────────────────
ALTER TABLE "exception_cases" RENAME COLUMN "orderId"           TO "order_id";
ALTER TABLE "exception_cases" RENAME COLUMN "packageId"         TO "package_id";
ALTER TABLE "exception_cases" RENAME COLUMN "createdByUserId"   TO "created_by_user_id";
ALTER TABLE "exception_cases" RENAME COLUMN "createdByAdminId"  TO "created_by_admin_id";
ALTER TABLE "exception_cases" RENAME COLUMN "resolvedAt"        TO "resolved_at";
ALTER TABLE "exception_cases" RENAME COLUMN "createdAt"         TO "created_at";
ALTER TABLE "exception_cases" RENAME COLUMN "updatedAt"         TO "updated_at";

-- ─── admin_action_logs ───────────────────────────────────────
ALTER TABLE "admin_action_logs" RENAME COLUMN "adminId"      TO "admin_id";
ALTER TABLE "admin_action_logs" RENAME COLUMN "targetType"   TO "target_type";
ALTER TABLE "admin_action_logs" RENAME COLUMN "targetId"     TO "target_id";
ALTER TABLE "admin_action_logs" RENAME COLUMN "beforeState"  TO "before_state";
ALTER TABLE "admin_action_logs" RENAME COLUMN "afterState"   TO "after_state";
ALTER TABLE "admin_action_logs" RENAME COLUMN "ipAddress"    TO "ip_address";
ALTER TABLE "admin_action_logs" RENAME COLUMN "userAgent"    TO "user_agent";
ALTER TABLE "admin_action_logs" RENAME COLUMN "createdAt"    TO "created_at";

-- ─── order_status_logs ───────────────────────────────────────
ALTER TABLE "order_status_logs" RENAME COLUMN "orderId"       TO "order_id";
ALTER TABLE "order_status_logs" RENAME COLUMN "fromStatus"    TO "from_status";
ALTER TABLE "order_status_logs" RENAME COLUMN "toStatus"      TO "to_status";
ALTER TABLE "order_status_logs" RENAME COLUMN "changedByType" TO "changed_by_type";
ALTER TABLE "order_status_logs" RENAME COLUMN "changedById"   TO "changed_by_id";
ALTER TABLE "order_status_logs" RENAME COLUMN "createdAt"     TO "created_at";

-- ─── notifications ───────────────────────────────────────────
ALTER TABLE "notifications" RENAME COLUMN "userId"    TO "user_id";
ALTER TABLE "notifications" RENAME COLUMN "isRead"    TO "is_read";
ALTER TABLE "notifications" RENAME COLUMN "sentAt"    TO "sent_at";
ALTER TABLE "notifications" RENAME COLUMN "createdAt" TO "created_at";

-- ─── address_usages ──────────────────────────────────────────
ALTER TABLE "address_usages" RENAME COLUMN "userId"              TO "user_id";
ALTER TABLE "address_usages" RENAME COLUMN "warehouseAddressId"  TO "warehouse_address_id";
ALTER TABLE "address_usages" RENAME COLUMN "copiedAt"            TO "copied_at";

-- ─── warehouse_addresses ─────────────────────────────────────
ALTER TABLE "warehouse_addresses" RENAME COLUMN "receiverName" TO "receiver_name";
ALTER TABLE "warehouse_addresses" RENAME COLUMN "addressLine"  TO "address_line";
ALTER TABLE "warehouse_addresses" RENAME COLUMN "postalCode"   TO "postal_code";
ALTER TABLE "warehouse_addresses" RENAME COLUMN "isActive"     TO "is_active";
ALTER TABLE "warehouse_addresses" RENAME COLUMN "createdAt"    TO "created_at";
ALTER TABLE "warehouse_addresses" RENAME COLUMN "updatedAt"    TO "updated_at";

-- ─── recommendations ─────────────────────────────────────────
ALTER TABLE "recommendations" RENAME COLUMN "seoTitle"       TO "seo_title";
ALTER TABLE "recommendations" RENAME COLUMN "seoDescription" TO "seo_description";
ALTER TABLE "recommendations" RENAME COLUMN "publishedAt"    TO "published_at";
ALTER TABLE "recommendations" RENAME COLUMN "createdAt"      TO "created_at";
ALTER TABLE "recommendations" RENAME COLUMN "updatedAt"      TO "updated_at";
