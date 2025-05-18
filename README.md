# Lendsqr Wallet Service

## Project Overview
The Lendsqr Wallet Service is a backend API built with Node.js, TypeScript, and Knex.js, designed to power wallet functionalities for a mobile lending app. It allows users to create accounts, fund wallets, transfer funds, withdraw money, and ensures users flagged in the Lendsqr Adjutor Karma blacklist cannot onboard.

## Tech Stack
- **Node.js (LTS)**
- **TypeScript**
- **Express.js**
- **Knex.js ORM**
- **MySQL** (JawsDB on Heroku for production)
- **Jest** for testing

## ER Diagram
View online: [Lendsqr Wallet ER Diagram](https://dbdesigner.page.link/mpEe6wD2Mg5gQAk79)

## Project Structure
- ├── __tests__/                   # Jest test suites
- │   └── wallet.test.ts           # Wallet funding tests
- ├── src/                         # Application source code
- │   ├── controllers/             # Request handlers and business logic
- │   ├── database/                # Knex migrations
- │   ├── middleware/              # Auth, authorization, blacklist checks
- │   ├── routes/                  # Express routers
- │   ├── utils/                   # Helper functions
- │   ├── db.ts                    # Knex instance and DB connection
- │   └── index.ts                 # App entrypoint
- ├── .env                         # Development environment variables
- ├── .env.test                    # Test environment variables
- ├── .gitignore                   # Git ignore rules
- ├── jest.setup.ts                # Jest setup file
- ├── knexfile.d.ts                # Knex config type definitions
- ├── knexfile.js                  # Knex config (JS)
- ├── package.json                 # Scripts and dependencies
- ├── Procfile                     # Heroku process declaration
- └── tsconfig.json                # TypeScript configuration


## Setup & Installation
1. **Clone the repo**  
   ```bash
   git clone https://github.com/Pharezzzz/Lendsqr-Wallet-Service.git
   cd Lendsqr-Wallet-Service

2. **Install dependencies**
   ```bash
   npm install

3. **Environment variables**
   Create a .env file in the project root and set your development database credentials and LENDSQR_BEARER_TOKEN. For example:
   - DB_HOST=localhost
   - DB_PORT=3306
   - DB_USER=root
   - DB_PASSWORD=yourpassword
   - DB_NAME=lendsqr_wallet
   - LENDSQR_BEARER_TOKEN=your_token_here

   Create a .env.test file in the project root and configure your test database credentials similarly:
   - DB_HOST=localhost
   - DB_PORT=3306
   - DB_USER=root
   - DB_PASSWORD=yourpassword
   - DB_NAME=test_database

4. **Run migrations**
   ```bash
   npx knex migrate:latest --env development

5. **Start the server**
   ```bash
   npx ts-node src/index.ts

6. **Run tests**
    ```bash
   npm test

## API Endpoints
1. User Onboarding
   ```makefile
   POST /users
   Headers:
      Content-Type: application/json
   Body:
      { "name": "Alice", "email": "alice@example.com" }
   Response:
      201 Created
      {
        "id": 1,
        "name": "Alice",
        "email": "alice@example.com",
        "balance": "0.00",
        "created_at": "2025-05-17T...Z"
       }
   _Blacklist check middleware ensures no blacklisted identity is onboarded._

2. Fund Wallet
   ```yaml
   POST /wallet/fund
   Headers:
      x-fake-token: token123
      Content-Type: application/json
   Body:
      { "userId": 1, "amount": 500 }
   Response:
      200 OK
      { "message": "Wallet funded successfully", "balance": 500 }
 
3. Withdraw from Wallet
   ```makefile
   POST /wallet/withdraw
   Headers:
      x-fake-token: token123
   Body:
      { "userId": 1, "amount": 200 }
   Response:
   200 OK
      { "message": "Withdrawal successful", "balance": 300 }

4. Transfer between Wallets
   ```makefile
   POST /wallet/transfer
   Headers:
      x-fake-token: token123
   Body:
      { "fromUserId": 1, "toUserId": 2, "amount": 100 }
   Response:
   200 OK
      {
        "message": "Transfer successful",
        "senderBalance": 400,
        "receiverBalance": 100
      }

5. Balance & Transaction History
   ```bash
   GET /wallet/balance/:userId
   GET /wallet/transactions/:userId

### Testing
Jest is configured to run under NODE_ENV=test.
Tests cover positive and negative scenarios for funding, auth, and business logic.

### Deployment
- Heroku: App deployed at
https://pharez-ayodele-lendsqr-be-test-0dc8fe162aa8.herokuapp.com/api/health

- Database: JawsDB MySQL, automatically migrated via
npx knex migrate:latest --env production

### Design Decisions
- TypeScript for static typing and maintainability.
- Knex.js for SQL-level control and transaction scoping.
- Middleware pattern for auth, blacklist checks, and async error handling.
- Faux tokens to simulate authentication without full OAuth/JWT complexity.
- Jest for unit tests, ensuring reliability and catching regressions.

### Next Steps
- Integrate real authentication (OAuth/JWT).
- Add rate limiting and request validation (Joi or Zod).
- Enhance monitoring and logging (New Relic, Sentry).
