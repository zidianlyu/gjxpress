UPDATE "customer_shipments"
SET "payment_status" = (
  CASE
    WHEN "payment_status"::text = 'PAID' THEN 'PAID'
    WHEN "payment_status"::text IN ('REFUND', 'REFUNDED') THEN 'REFUNDED'
    ELSE 'UNPAID'
  END
)::"PaymentStatus"
WHERE "payment_status"::text NOT IN ('UNPAID', 'PAID', 'REFUNDED')
  OR "payment_status" IS NULL;

ALTER TABLE "customer_shipments"
  DROP CONSTRAINT IF EXISTS "customer_shipments_payment_status_allowed";

ALTER TABLE "customer_shipments"
  ADD CONSTRAINT "customer_shipments_payment_status_allowed"
  CHECK ("payment_status"::text IN ('UNPAID', 'PAID', 'REFUNDED'));
