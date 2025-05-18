import { Request, Response, NextFunction } from 'express';

// Extend Express Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export const authorizeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  console.log('authorizeUser called');
  const authUserId = req.userId;
  const targetUserId = req.body.userId;

  if (!authUserId) {
    return res.status(401).json({ message: 'Unauthorized: No authenticated user found' });
  }

  if (authUserId !== targetUserId) {
    return res.status(403).json({ message: 'Forbidden: You can only operate on your own account.' });
  }

  return next();
};