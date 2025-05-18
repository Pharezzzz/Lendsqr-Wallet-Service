import { Request, Response } from 'express';
import db from '../db';

export const fundWallet = async (req: Request, res: Response): Promise<Response> => {
  console.log('fundWallet called');
  try {
    const { userId, amount } = req.body;

    // Validate inputs
    if (!userId || !amount || isNaN(amount)) {
      return res.status(400).json({ message: 'userId and amount are required, and amount must be a number.' });
    }

    // Variable to hold the updated balance after transaction
    let newBalance: number | undefined;

    // Begin a transaction
    await db.transaction(async (trx) => {
      // Fetch the user
      const user = await trx('users').where({ id: userId }).first();
      if (!user) {
        throw new Error('User not found');
      }

      // Calculate new balance
      newBalance = parseFloat(user.balance) + parseFloat(amount);

      // Update the user's balance
      await trx('users').where({ id: userId }).update({ balance: newBalance });

      // Record the transaction in a transactions table
      await trx('transactions').insert({
        user_id: userId,
        amount,
        type: 'credit',
        description: 'Wallet funded'
      });
    });

    if (newBalance === undefined) {
        // This should never happen, but just in case
        return res.status(500).json({ message: 'Could not fund wallet' });
    }

    // Send response AFTER transaction succeeds
    return res.status(200).json({ 
        message: 'Wallet funded successfully', 
        balance: newBalance 
    });

  } catch (err: any) {
    // Handle errors and send appropriate response
    const message = err.message === 'User not found' ? err.message : 'Internal server error';
    const status = err.message === 'User not found' ? 404 : 500;
    return res.status(status).json({ message });
  }
};


export const getWalletBalance = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await db('users').where({ id: userId }).first();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ balance: user.balance });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


export const getTransactionHistory = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Fetch all transactions for the user, ordered by most recent first
    const transactions = await db('transactions')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc');

    return res.status(200).json({ transactions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


export const withdrawFromWallet = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId, amount } = req.body;

    // Validate inputs
    if (!userId || !amount || isNaN(amount)) {
      return res.status(400).json({ message: 'userId and amount are required, and amount must be a number.' });
    }

    // Start transaction
    const result = await db.transaction(async (trx) => {
      // Find user wallet
      const user = await trx('users').where({ id: userId }).first();

      if (!user) {
        throw new Error('User not found');
      }

      const currentBalance = parseFloat(user.balance);

      if (amount > currentBalance) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }

      // Calculate new balance
      const newBalance = currentBalance - parseFloat(amount);

      // Update balance
      await trx('users').where({ id: userId }).update({ balance: newBalance });

      // Record transaction with 'debit' type
      await trx('transactions').insert({
        user_id: userId,
        amount,
        type: 'debit',
        description: 'Wallet withdrawal',
      });

      // Respond success
      return res.status(200).json({ message: 'Withdrawal successful', balance: newBalance });
    });

    return result;

  } catch (error: any) {
    if (error.message === 'User not found') {
      return res.status(404).json({ message: 'User not found' });
    }
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


export const transferBetweenWallets = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { fromUserId, toUserId, amount } = req.body;

    // Validate required fields
    if (!fromUserId || !toUserId || !amount || isNaN(amount)) {
      return res.status(400).json({
        message: 'fromUserId, toUserId, and amount are required, and amount must be a number.'
      });
    }

    // Validate that the authenticated user matches fromUserId
    if (req.userId !== fromUserId) {
      return res.status(403).json({
        message: 'Forbidden: You can only transfer from your own account.'
      });
    }

    // Prevent transfer to self
    if (fromUserId === toUserId) {
      return res.status(400).json({
        message: 'Cannot transfer to the same user.'
      });
    }

    // Start transaction
    const result = await db.transaction(async (trx) => {
      // Fetch sender and receiver
      const sender = await trx('users').where({ id: fromUserId }).first();
      const receiver = await trx('users').where({ id: toUserId }).first();

      if (!sender) throw new Error('Sender not found');
      if (!receiver) throw new Error('Receiver not found');

      const senderBalance = parseFloat(sender.balance);
      const transferAmount = parseFloat(amount);

      if (transferAmount > senderBalance) {
        return res.status(400).json({ message: 'Insufficient balance for transfer.' });
      }

      // Deduct from sender
      const senderNewBalance = senderBalance - transferAmount;
      await trx('users').where({ id: fromUserId }).update({ balance: senderNewBalance });

      // Add to receiver
      const receiverNewBalance = parseFloat(receiver.balance) + transferAmount;
      await trx('users').where({ id: toUserId }).update({ balance: receiverNewBalance });

      // Record transactions
      await trx('transactions').insert([
        {
          user_id: fromUserId,
          amount: transferAmount,
          type: 'debit',
          description: `Transfer to user ${toUserId}`,
        },
        {
          user_id: toUserId,
          amount: transferAmount,
          type: 'credit',
          description: `Transfer from user ${fromUserId}`,
        },
      ]);

      return res.status(200).json({
        message: 'Transfer successful',
        senderBalance: senderNewBalance,
        receiverBalance: receiverNewBalance,
      });
    });

    return result;

  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};