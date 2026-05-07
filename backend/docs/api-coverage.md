# Backend API Coverage

## Active Coverage

- Health: `GET /api/health`
- Auth: admin login and JWT profile
- Public: registration and tracking
- Admin: customers, customer registrations, inbound packages, customer shipments, master shipments, transactions
- Storage: image upload/delete flows through backend

## Removed Coverage

The retired mini program login route has been removed from backend API coverage. Backend no longer documents or tests that login path.

## Contact Fields

`wechatId` remains an optional contact/search field for Customer and CustomerRegistration APIs.
