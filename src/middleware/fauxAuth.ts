import { Request, Response, NextFunction } from 'express';

// Extend Request type to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

const VALID_FAKE_TOKENS = new Map<string, number>([
  // token string => userId mapping
  ['token123', 1],
  ['token456', 2],
]);

export const fauxAuth = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  console.log('fauxAuth called');
  const token = req.header('x-fake-token');

  if (!token || !VALID_FAKE_TOKENS.has(token)) {
    return res.status(401).json({ message: 'Unauthorized: Invalid or missing token' });
  }

  // Attach userId to request
  req.userId = VALID_FAKE_TOKENS.get(token);
  return next();
};