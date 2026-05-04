import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // Database (required)
  DATABASE_URL: Joi.string().required().messages({
    'any.required': 'DATABASE_URL is required. Get it from Supabase Dashboard → Settings → Database → Connection String (Transaction pooler).',
  }),
  DIRECT_URL: Joi.string().required().messages({
    'any.required': 'DIRECT_URL is required. Get it from Supabase Dashboard → Settings → Database → Connection String (Session mode / Direct).',
  }),

  // Supabase (required)
  SUPABASE_URL: Joi.string().required().messages({
    'any.required': 'SUPABASE_URL is required. Get it from Supabase Dashboard → Settings → API → Project URL.',
  }),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().required().messages({
    'any.required': 'SUPABASE_SERVICE_ROLE_KEY is required. Get it from Supabase Dashboard → Settings → API → service_role key.',
  }),

  // JWT (required)
  JWT_SECRET: Joi.string().min(32).required().messages({
    'any.required': 'JWT_SECRET is required. Use a strong random string (min 32 characters).',
    'string.min': 'JWT_SECRET must be at least 32 characters.',
  }),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  ADMIN_JWT_EXPIRES_IN: Joi.string().default('1d'),

  // WeChat (conditional)
  WECHAT_MOCK_LOGIN: Joi.string().valid('true', 'false').default('false'),
  WECHAT_APP_ID: Joi.string().when('WECHAT_MOCK_LOGIN', {
    is: 'false',
    then: Joi.string().required().messages({
      'any.required': 'WECHAT_APP_ID is required when WECHAT_MOCK_LOGIN is not true.',
    }),
    otherwise: Joi.string().allow('').optional(),
  }),
  WECHAT_APP_SECRET: Joi.string().when('WECHAT_MOCK_LOGIN', {
    is: 'false',
    then: Joi.string().required().messages({
      'any.required': 'WECHAT_APP_SECRET is required when WECHAT_MOCK_LOGIN is not true.',
    }),
    otherwise: Joi.string().allow('').optional(),
  }),
  WECHAT_CODE2SESSION_URL: Joi.string().default('https://api.weixin.qq.com/sns/jscode2session'),

  // Warehouse address
  WAREHOUSE_RECIPIENT_NAME: Joi.string().default('广骏仓库'),
  WAREHOUSE_PHONE: Joi.string().allow('').default(''),
  WAREHOUSE_COUNTRY: Joi.string().default('中国'),
  WAREHOUSE_PROVINCE: Joi.string().allow('').default(''),
  WAREHOUSE_CITY: Joi.string().allow('').default(''),
  WAREHOUSE_DISTRICT: Joi.string().allow('').default(''),
  WAREHOUSE_ADDRESS_LINE: Joi.string().allow('').default(''),
  WAREHOUSE_POSTAL_CODE: Joi.string().allow('').default(''),
  WAREHOUSE_COPY_TEMPLATE: Joi.string().allow('').default('收件人：{recipientName}\n电话：{phone}\n地址：{fullAddress}\n邮编：{postalCode}'),

  // Storage
  SUPABASE_STORAGE_BUCKET_PACKAGE_IMAGES: Joi.string().default('gjxpress-storage'),

  // Server
  PORT: Joi.number().default(3000),
  CORS_ORIGINS: Joi.string().optional(),
}).options({ allowUnknown: true });
