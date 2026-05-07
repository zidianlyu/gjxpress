ALTER TABLE "customer_shipments"
  ADD COLUMN "shipment_type" TEXT NOT NULL DEFAULT 'AIR_GENERAL';

ALTER TABLE "customer_shipments"
  DROP CONSTRAINT IF EXISTS "customer_shipments_shipment_type_allowed";

ALTER TABLE "customer_shipments"
  ADD CONSTRAINT "customer_shipments_shipment_type_allowed"
  CHECK ("shipment_type" IN ('AIR_GENERAL', 'AIR_SENSITIVE', 'SEA'));
