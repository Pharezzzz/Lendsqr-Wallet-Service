import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import db from '../db';
import { extractIdentity } from '../utils/extractIdentity';

const LENDSQR_API_BASE = 'https://adjutor.lendsqr.com/v2/verification/karma';
const LENDSQR_BEARER_TOKEN = process.env.LENDSQR_BEARER_TOKEN || '';

export const checkKarmaBlacklist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let identityToCheck = req.body.identity;
  
      if (!identityToCheck && req.body.email) {
        identityToCheck = req.body.email;
        console.log(`Using email from request body as identity: ${identityToCheck}`);
      }
  
      if (!identityToCheck && req.body.userId) {
        const user = await db('users').where({ id: req.body.userId }).first();
        if (!user) {
          console.log(`User with ID ${req.body.userId} not found.`);
          return res.status(404).json({ message: 'User not found' });
        }
        identityToCheck = extractIdentity(user);
        console.log(`Extracted identity from user record: ${identityToCheck}`);
      }
  
      if (!identityToCheck) {
        console.log('No valid identity found for karma check');
        return res.status(400).json({ message: 'No valid identity found for karma check' });
      }
  
      console.log(`Checking Karma blacklist for identity: ${identityToCheck}`);
  
      const response = await axios.get(`${LENDSQR_API_BASE}/${encodeURIComponent(identityToCheck)}`, {
        headers: { Authorization: `Bearer ${LENDSQR_BEARER_TOKEN}` },
      });
  
      const karmaData = response.data;
      console.log('Karma API response:', karmaData);
  
      if (karmaData.karma_identity) {
        console.log(`User is blacklisted: ${karmaData.reason}`);
        return res.status(403).json({
          message: 'User is blacklisted by Karma',
          reason: karmaData.reason,
          amountInContention: karmaData.amount_in_contention,
          defaultDate: karmaData.default_date,
          karmaType: karmaData.karma_type?.karma,
        });
      }
  
      console.log('User not blacklisted, continuing...');
      next();
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.log('User not found in Karma blacklist, allowed');
        next();
      } else {
        console.error('Karma check failed:', error.message || error);
        return res.status(500).json({ message: 'Failed to verify karma blacklist' });
      }
    }
  };  