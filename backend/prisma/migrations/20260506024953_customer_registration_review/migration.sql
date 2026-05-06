-- CreateEnum
CREATE TYPE "CustomerRegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "domestic_return_address" TEXT;

-- CreateTable
CREATE TABLE "customer_registrations" (
    "id" UUID NOT NULL,
    "customer_code" VARCHAR(16) NOT NULL,
    "phone_country_code" VARCHAR(8) NOT NULL DEFAULT '+86',
    "phone_number" VARCHAR(32) NOT NULL,
    "wechat_id" VARCHAR(64),
    "domestic_return_address" TEXT,
    "notes" TEXT,
    "status" "CustomerRegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "approved_at" TIMESTAMP(3),
    "approved_by_admin_id" UUID,
    "rejected_at" TIMESTAMP(3),
    "rejected_by_admin_id" UUID,
    "review_note" TEXT,
    "created_customer_id" UUID,
    "ip_hash" VARCHAR(128),
    "user_agent" VARCHAR(512),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_registrations_customer_code_key" ON "customer_registrations"("customer_code");

-- CreateIndex
CREATE INDEX "customer_registrations_customer_code_idx" ON "customer_registrations"("customer_code");

-- CreateIndex
CREATE INDEX "customer_registrations_phone_number_idx" ON "customer_registrations"("phone_number");

-- CreateIndex
CREATE INDEX "customer_registrations_wechat_id_idx" ON "customer_registrations"("wechat_id");

-- CreateIndex
CREATE INDEX "customer_registrations_status_idx" ON "customer_registrations"("status");

-- CreateIndex
CREATE INDEX "customer_registrations_created_at_idx" ON "customer_registrations"("created_at");

-- AddForeignKey
ALTER TABLE "customer_registrations" ADD CONSTRAINT "customer_registrations_created_customer_id_fkey" FOREIGN KEY ("created_customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
