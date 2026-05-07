# API Contract

## Active Contract

All business clients use backend APIs. The active clients are the Public website and Admin Portal.

Frontend clients must not call Supabase directly.

## Core APIs

- `GET /api/health`
- `POST /api/auth/admin-login`
- `GET /api/auth/me`
- Public registration APIs
- Public tracking APIs
- Admin customer APIs
- Admin customer registration review APIs
- Admin inbound package APIs
- Admin customer shipment APIs
- Admin master shipment APIs
- Admin transaction APIs
- Backend-managed Storage upload/delete APIs

## Removed Contract

The mini program login/API contract has been removed. Backend no longer accepts login codes from a mini program and no longer exchanges them with third-party session APIs.

## Contact Fields

`wechatId` remains a customer/contact field where present in Customer or CustomerRegistration APIs. It is not authentication identity.
