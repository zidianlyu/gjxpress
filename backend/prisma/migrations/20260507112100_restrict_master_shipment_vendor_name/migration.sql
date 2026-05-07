UPDATE "master_shipments"
SET "vendor_name" = (
  CASE
    WHEN UPPER(BTRIM("vendor_name")) IN ('DHL', 'UPS', 'FEDEX', 'EMS', 'OTHER')
      THEN UPPER(BTRIM("vendor_name"))
    ELSE 'OTHER'
  END
)
WHERE "vendor_name" IS NULL
  OR UPPER(BTRIM("vendor_name")) NOT IN ('DHL', 'UPS', 'FEDEX', 'EMS', 'OTHER')
  OR "vendor_name" <> UPPER(BTRIM("vendor_name"));

ALTER TABLE "master_shipments"
  DROP CONSTRAINT IF EXISTS "master_shipments_vendor_name_allowed";

ALTER TABLE "master_shipments"
  ADD CONSTRAINT "master_shipments_vendor_name_allowed"
  CHECK ("vendor_name" IN ('DHL', 'UPS', 'FEDEX', 'EMS', 'OTHER'));
