/**
 * Tests for custom error classes
 */

const {
  AppError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  ValidationError,
} = require('../../../src/utils/errors');

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create an error with message, status code, and code', () => {
      const error = new AppError('Test error', 400, 'TEST_ERROR');

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.isOperational).toBe(true);
      expect(error).toBeInstanceOf(Error);
    });

    it('should have stack trace', () => {
      const error = new AppError('Test error', 400);

      expect(error.stack).toBeDefined();
    });
  });

  describe('BadRequestError', () => {
    it('should create 400 error with default message', () => {
      const error = new BadRequestError();

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Solicitud inválida');
      expect(error.code).toBe('BAD_REQUEST');
    });

    it('should create 400 error with custom message', () => {
      const error = new BadRequestError('Custom message', 'CUSTOM_CODE');

      expect(error.message).toBe('Custom message');
      expect(error.code).toBe('CUSTOM_CODE');
    });
  });

  describe('UnauthorizedError', () => {
    it('should create 401 error', () => {
      const error = new UnauthorizedError();

      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('No autorizado');
    });
  });

  describe('NotFoundError', () => {
    it('should create 404 error', () => {
      const error = new NotFoundError('Resource not found');

      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Resource not found');
    });
  });

  describe('ConflictError', () => {
    it('should create 409 error', () => {
      const error = new ConflictError();

      expect(error.statusCode).toBe(409);
    });
  });

  describe('ValidationError', () => {
    it('should create 422 error with validation details', () => {
      const validationErrors = [
        { field: 'email', message: 'Invalid email' },
        { field: 'password', message: 'Too short' },
      ];
      const error = new ValidationError('Validation failed', validationErrors);

      expect(error.statusCode).toBe(422);
      expect(error.message).toBe('Validation failed');
      expect(error.errors).toEqual(validationErrors);
      expect(error.errors).toHaveLength(2);
    });
  });
});
