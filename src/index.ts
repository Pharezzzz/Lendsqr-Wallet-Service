import dotenv from 'dotenv';
import walletRoutes from './routes/walletRoutes';
import express, { Request, Response, NextFunction } from 'express';
import knex from 'knex';
import knexConfig from '../knexfile.js';
import { checkKarmaBlacklist } from './middleware/checkKarmaBlacklist';

// Load environment variables depending on environment
dotenv.config({
    path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  });

const app = express();
const port = process.env.PORT || 3000;

// Setup knex instance using the development config
const environment = process.env.NODE_ENV || 'development';
const db = knex(knexConfig[environment]);

app.use(express.json());

app.use('/wallet', walletRoutes);

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
}
  
// POST /users - create a new user, with karma blacklist check
app.post('/users', asyncHandler(checkKarmaBlacklist), asyncHandler(async (req, res) => {
    const { name, email } = req.body;
  
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
  
    const [id] = await db('users').insert({ name, email });
    const user = await db('users').where({ id }).first();
  
    res.status(201).json(user);
  }));

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running!' });
});

// Add error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
  });

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

export { app };

