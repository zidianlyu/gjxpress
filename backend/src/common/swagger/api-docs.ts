import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

const errorSchema = {
  type: 'object',
  properties: {
    statusCode: { type: 'integer', example: 400 },
    message: {
      oneOf: [
        { type: 'string', example: 'Validation failed' },
        { type: 'array', items: { type: 'string' }, example: ['field must be a string'] },
      ],
    },
    error: { type: 'string', nullable: true, example: 'Bad Request' },
    path: { type: 'string', example: '/api/example' },
    requestId: { type: 'string', example: 'req_01HY...' },
    timestamp: { type: 'string', format: 'date-time' },
  },
  additionalProperties: true,
};

export const dataEnvelopeSchema = (data: Record<string, unknown> = { type: 'object', additionalProperties: true }) => ({
  type: 'object',
  properties: {
    data,
  },
  required: ['data'],
});

export const paginatedSchema = (item: Record<string, unknown> = { type: 'object', additionalProperties: true }) => ({
  type: 'object',
  properties: {
    data: { type: 'array', items: item },
    pagination: {
      type: 'object',
      properties: {
        page: { type: 'integer', example: 1 },
        pageSize: { type: 'integer', example: 20 },
        total: { type: 'integer', example: 42 },
        totalPages: { type: 'integer', example: 3 },
      },
      required: ['page', 'pageSize', 'total', 'totalPages'],
    },
  },
  required: ['data', 'pagination'],
});

export const itemsPaginatedSchema = (item: Record<string, unknown> = { type: 'object', additionalProperties: true }) => ({
  type: 'object',
  properties: {
    items: { type: 'array', items: item },
    page: { type: 'integer', example: 1 },
    pageSize: { type: 'integer', example: 20 },
    total: { type: 'integer', example: 42 },
  },
  required: ['items', 'page', 'pageSize', 'total'],
});

export const deletedSchema = {
  type: 'object',
  properties: {
    deleted: { type: 'boolean', example: true },
    id: { type: 'string', format: 'uuid' },
  },
  required: ['deleted', 'id'],
};

export const imageListSchema = {
  type: 'object',
  properties: {
    items: { type: 'array', items: { type: 'string', format: 'uri' } },
  },
  required: ['items'],
};

export const imageMutationSchema = {
  type: 'object',
  properties: {
    url: { type: 'string', format: 'uri' },
    deleted: { type: 'boolean' },
    imageUrls: { type: 'array', items: { type: 'string', format: 'uri' } },
  },
  additionalProperties: false,
};

export function ApiStandardResponses(options: { auth?: boolean; forbidden?: boolean; notFound?: boolean; conflict?: boolean } = {}) {
  const decorators = [
    ApiBadRequestResponse({ description: 'Invalid request, validation error, or failed business precondition.', schema: errorSchema }),
    ApiInternalServerErrorResponse({ description: 'Unexpected server error.', schema: errorSchema }),
  ];
  if (options.auth) {
    decorators.push(ApiUnauthorizedResponse({ description: 'Missing, invalid, or expired bearer token.', schema: errorSchema }));
  }
  if (options.forbidden) {
    decorators.push(ApiForbiddenResponse({ description: 'Authenticated user is not allowed to perform this action.', schema: errorSchema }));
  }
  if (options.notFound) {
    decorators.push(ApiNotFoundResponse({ description: 'Requested resource was not found.', schema: errorSchema }));
  }
  if (options.conflict) {
    decorators.push(ApiConflictResponse({ description: 'Request conflicts with current resource state.', schema: errorSchema }));
  }
  return applyDecorators(...decorators);
}

export function ApiIdParam(name = 'id', description = 'Resource identifier') {
  return ApiParam({ name, required: true, type: String, description, example: 'b7f8f2e4-2e6a-4d1f-9c1b-6c7f7a1a0001' });
}

export function ApiPaginationQueries() {
  return applyDecorators(
    ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number, starting from 1.', example: 1 }),
    ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Items per page. Services cap this value.', example: 20 }),
  );
}

export function ApiGenericOk(description = 'Successful response') {
  return ApiOkResponse({ description, schema: dataEnvelopeSchema() });
}

export function ApiGenericCreated(description = 'Created successfully') {
  return ApiResponse({ status: 201, description, schema: dataEnvelopeSchema() });
}

export function ApiPaginatedOk(description = 'Paginated response') {
  return ApiOkResponse({ description, schema: paginatedSchema() });
}

export function ApiItemsPaginatedOk(description = 'Paginated response') {
  return ApiOkResponse({ description, schema: itemsPaginatedSchema() });
}

export function ApiMultipartFile(fieldName = 'file') {
  return ApiBody({
    schema: {
      type: 'object',
      required: [fieldName],
      properties: {
        [fieldName]: {
          type: 'string',
          format: 'binary',
          description: 'File uploaded as multipart/form-data.',
        },
      },
    },
  });
}
