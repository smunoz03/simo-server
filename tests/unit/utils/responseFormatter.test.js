/**
 * Tests for response formatter utilities
 */

const {
  sendSuccess,
  sendOk,
  sendCreated,
  sendNoContent,
} = require('../../../src/utils/responseFormatter');

describe('Response Formatter', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe('sendSuccess', () => {
    it('should send success response with data', () => {
      const data = { user: { id: 1, name: 'Test' } };
      sendSuccess(mockRes, 200, data);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data,
      });
    });

    it('should send success response with message and data', () => {
      const data = { user: { id: 1 } };
      sendSuccess(mockRes, 201, data, 'User created');

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'User created',
        data,
      });
    });

    it('should send success response without data', () => {
      sendSuccess(mockRes, 200, null, 'Operation successful');

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Operation successful',
      });
    });
  });

  describe('sendOk', () => {
    it('should send 200 OK response', () => {
      const data = { items: [] };
      sendOk(mockRes, data);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data,
      });
    });
  });

  describe('sendCreated', () => {
    it('should send 201 Created response', () => {
      const data = { id: 1 };
      sendCreated(mockRes, data);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data,
      });
    });

    it('should send 201 Created response with message', () => {
      const data = { id: 1 };
      sendCreated(mockRes, data, 'Resource created');

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Resource created',
        data,
      });
    });
  });

  describe('sendNoContent', () => {
    it('should send 204 No Content response', () => {
      sendNoContent(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
    });
  });
});
