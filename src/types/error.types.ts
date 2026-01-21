/**
 * API Error
 * Base error class for API-related errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Validation Error
 * Thrown when request validation fails (422)
 */
export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 422, details);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication Error
 * Thrown when authentication fails (401)
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = 'Não autenticado') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error
 * Thrown when user lacks permissions (403)
 */
export class AuthorizationError extends ApiError {
  constructor(message: string = 'Sem permissão') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not Found Error
 * Thrown when resource is not found (404)
 */
export class NotFoundError extends ApiError {
  constructor(message: string = 'Recurso não encontrado') {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}
