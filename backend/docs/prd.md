# Backend PRD

The backend supports the Web product line for 广骏供应链服务.

## Responsibilities

- Admin auth and JWT validation
- Public registration
- Public tracking
- Customer and customerCode workflows
- Customer registration review
- Inbound package operations
- Customer shipment operations
- Master shipment operations
- Transaction records
- Supabase Storage image upload/delete flows
- Health check

## Removed

The retired mini program auth flow has been removed. Backend no longer exchanges client login codes for third-party user identity and no longer requires related app credentials.

## Preserved Contact Data

Customer `wechatId` fields are contact fields, not authentication identity.
