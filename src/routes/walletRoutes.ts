import express from 'express';
import { fundWallet, getWalletBalance, getTransactionHistory, withdrawFromWallet, transferBetweenWallets } from '../controllers/walletController';
import { asyncHandler } from '../utils/asyncHandler';
import { fauxAuth } from '../middleware/fauxAuth';
import { authorizeUser } from '../middleware/authorizeUser';

const router = express.Router();

// Protect routes that require authentication
router.post('/fund', asyncHandler(fauxAuth), asyncHandler(authorizeUser), asyncHandler(fundWallet));
router.post('/withdraw', asyncHandler(fauxAuth), asyncHandler(withdrawFromWallet));
router.post('/transfer', asyncHandler(fauxAuth), asyncHandler(transferBetweenWallets));

// Public or read-only routes can remain open or optionally protected
router.get('/balance/:userId', asyncHandler(getWalletBalance));
router.get('/transactions/:userId', asyncHandler(getTransactionHistory));

router.get('/test', (req, res) => {
    res.json({ message: 'Wallet route works!' });
});

export default router;
