ALTER TABLE "inbound_packages" ADD COLUMN "note" TEXT;

UPDATE "inbound_packages"
SET "note" = NULLIF(
  concat_ws(
    E'\n',
    CASE
      WHEN NULLIF(BTRIM("admin_note"), '') IS NOT NULL
        THEN '管理员备注：' || "admin_note"
      ELSE NULL
    END,
    CASE
      WHEN NULLIF(BTRIM("issue_note"), '') IS NOT NULL
        THEN '异常备注：' || "issue_note"
      ELSE NULL
    END
  ),
  ''
)
WHERE
  NULLIF(BTRIM("admin_note"), '') IS NOT NULL
  OR NULLIF(BTRIM("issue_note"), '') IS NOT NULL;

ALTER TABLE "inbound_packages" DROP COLUMN "admin_note";
ALTER TABLE "inbound_packages" DROP COLUMN "issue_note";
