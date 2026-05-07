ALTER TYPE "MasterShipmentStatus" ADD VALUE IF NOT EXISTS 'SIGNED';
ALTER TYPE "MasterShipmentStatus" ADD VALUE IF NOT EXISTS 'READY_FOR_PICKUP';

ALTER TABLE "master_shipments"
  ALTER COLUMN "status" DROP DEFAULT;

UPDATE "master_shipments"
SET "status" = (
  CASE
    WHEN "status"::text IN ('CREATED', 'PENDING', 'IN_PROGRESS', 'TRANSPORTING', 'HANDED_TO_VENDOR', 'IN_TRANSIT', 'TRANSFER_OR_CUSTOMS_PROCESSING') THEN 'IN_TRANSIT'
    WHEN "status"::text IN ('ARRIVED', 'DELIVERED', 'SIGNED', 'ARRIVED_OVERSEAS', 'CLOSED') THEN 'SIGNED'
    WHEN "status"::text = 'READY_FOR_PICKUP' THEN 'READY_FOR_PICKUP'
    WHEN "status"::text IN ('EXCEPTION', 'ERROR') THEN 'EXCEPTION'
    ELSE 'IN_TRANSIT'
  END
)::"MasterShipmentStatus";

ALTER TABLE "master_shipments"
  ALTER COLUMN "status" SET DEFAULT 'IN_TRANSIT';

ALTER TABLE "master_shipments"
  ALTER COLUMN "public_visible" SET DEFAULT true;

ALTER TABLE "master_shipments"
  DROP COLUMN IF EXISTS "public_title",
  DROP COLUMN IF EXISTS "public_summary",
  DROP COLUMN IF EXISTS "public_status_text";
