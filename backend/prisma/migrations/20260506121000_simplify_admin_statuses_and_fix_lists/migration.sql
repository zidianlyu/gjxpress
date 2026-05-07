/*
  This migration is intentionally create-only for review before applying to a shared Supabase Postgres database.

  Scope:
  - Normalize InboundPackageStatus to UNIDENTIFIED / ARRIVED / CONSOLIDATED.
  - Normalize CustomerShipmentStatus to PACKED / SHIPPED / ARRIVED / READY_FOR_PICKUP / PICKED_UP / EXCEPTION.
  - Add customer_shipments.quantity with a non-null default of 1.
  - Keep inbound_packages.customer_id as the UUID FK; Admin APIs resolve customer_code in application code.
  - Ensure inbound_packages.domestic_tracking_no is nullable while keeping the existing unique behavior for non-null values.
*/

-- Ensure domestic tracking numbers may be omitted. The existing unique index still
-- allows multiple NULL values in Postgres while preventing duplicate non-null values.
ALTER TABLE "inbound_packages" ALTER COLUMN "domestic_tracking_no" DROP NOT NULL;

-- Add quantity for customer shipment piece count.
ALTER TABLE "customer_shipments" ADD COLUMN IF NOT EXISTS "quantity" INTEGER NOT NULL DEFAULT 1;

-- Simplify inbound package statuses and map existing rows before removing old enum values.
ALTER TABLE "inbound_packages" ALTER COLUMN "status" DROP DEFAULT;

ALTER TYPE "InboundPackageStatus" RENAME TO "InboundPackageStatus_old";
CREATE TYPE "InboundPackageStatus" AS ENUM ('UNIDENTIFIED', 'ARRIVED', 'CONSOLIDATED');

ALTER TABLE "inbound_packages"
  ALTER COLUMN "status" TYPE "InboundPackageStatus"
  USING (
    CASE "status"::text
      WHEN 'UNCLAIMED' THEN 'UNIDENTIFIED'
      WHEN 'PREALERTED_NOT_ARRIVED' THEN 'UNIDENTIFIED'
      WHEN 'CONSOLIDATED' THEN 'CONSOLIDATED'
      WHEN 'CLAIMED' THEN 'ARRIVED'
      WHEN 'ARRIVED_WAREHOUSE' THEN 'ARRIVED'
      WHEN 'PENDING_CONFIRMATION' THEN 'ARRIVED'
      WHEN 'CONFIRMED' THEN 'ARRIVED'
      WHEN 'ISSUE_REPORTED' THEN 'ARRIVED'
      WHEN 'INBOUND_EXCEPTION' THEN 'ARRIVED'
      ELSE 'ARRIVED'
    END
  )::"InboundPackageStatus";

ALTER TABLE "inbound_packages" ALTER COLUMN "status" SET DEFAULT 'UNIDENTIFIED';
DROP TYPE "InboundPackageStatus_old";

-- Simplify customer shipment statuses and map existing rows before removing old enum values.
ALTER TABLE "customer_shipments" ALTER COLUMN "status" DROP DEFAULT;

ALTER TYPE "CustomerShipmentStatus" RENAME TO "CustomerShipmentStatus_old";
CREATE TYPE "CustomerShipmentStatus" AS ENUM ('PACKED', 'SHIPPED', 'ARRIVED', 'READY_FOR_PICKUP', 'PICKED_UP', 'EXCEPTION');

ALTER TABLE "customer_shipments"
  ALTER COLUMN "status" TYPE "CustomerShipmentStatus"
  USING (
    CASE "status"::text
      WHEN 'DRAFT' THEN 'PACKED'
      WHEN 'PACKED' THEN 'PACKED'
      WHEN 'SENT_TO_OVERSEAS' THEN 'SHIPPED'
      WHEN 'ARRIVED_OVERSEAS' THEN 'ARRIVED'
      WHEN 'READY_FOR_PICKUP' THEN 'READY_FOR_PICKUP'
      WHEN 'LOCAL_DELIVERY_REQUESTED' THEN 'READY_FOR_PICKUP'
      WHEN 'LOCAL_DELIVERY_IN_PROGRESS' THEN 'READY_FOR_PICKUP'
      WHEN 'PICKED_UP' THEN 'PICKED_UP'
      WHEN 'COMPLETED' THEN 'PICKED_UP'
      WHEN 'EXCEPTION' THEN 'EXCEPTION'
      ELSE 'PACKED'
    END
  )::"CustomerShipmentStatus";

ALTER TABLE "customer_shipments" ALTER COLUMN "status" SET DEFAULT 'PACKED';
DROP TYPE "CustomerShipmentStatus_old";
