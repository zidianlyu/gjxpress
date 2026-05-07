WITH latest_transaction_type AS (
  SELECT DISTINCT ON ("customer_shipment_id")
    "customer_shipment_id",
    "type"::text AS "type_text"
  FROM "transaction_records"
  WHERE "type"::text IN ('AIR_GENERAL', 'AIR_SENSITIVE', 'SEA')
  ORDER BY "customer_shipment_id", "occurred_at" DESC, "created_at" DESC
)
UPDATE "customer_shipments" AS cs
SET "shipment_type" = latest_transaction_type."type_text"
FROM latest_transaction_type
WHERE cs."id" = latest_transaction_type."customer_shipment_id";

UPDATE "customer_shipments" AS cs
SET "payment_status" = 'REFUNDED'::"PaymentStatus"
WHERE EXISTS (
  SELECT 1
  FROM "transaction_records" AS tr
  WHERE tr."customer_shipment_id" = cs."id"
    AND tr."type"::text = 'REFUND'
);

UPDATE "customer_shipments" AS cs
SET "payment_status" = 'PAID'::"PaymentStatus"
WHERE EXISTS (
  SELECT 1
  FROM "transaction_records" AS tr
  WHERE tr."customer_shipment_id" = cs."id"
    AND tr."type"::text IN ('AIR_GENERAL', 'AIR_SENSITIVE', 'SEA', 'SHIPPING_FEE')
)
AND NOT EXISTS (
  SELECT 1
  FROM "transaction_records" AS tr
  WHERE tr."customer_shipment_id" = cs."id"
    AND tr."type"::text = 'REFUND'
);

ALTER TABLE "transaction_records" DROP COLUMN "type";
