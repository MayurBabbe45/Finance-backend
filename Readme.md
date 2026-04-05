# Finance Data Processing & Access Control API

A production-grade, highly scalable backend service for managing financial records, user roles, and dashboard aggregations. Built with strict separation of concerns, robust validation, and optimized database queries.

## 1. Architectural Overview

This application utilizes a **Feature-Based (Domain-Driven) Architecture** rather than a traditional MVC structure. This approach groups routes, controllers, services, and validations by their business domain (e.g., `auth`, `records`, `dashboard`), resulting in high cohesion and easier scalability.

### Key Technical Decisions:
* **Strict Layering:** Controllers handle HTTP requests/responses exclusively. All business logic and database interactions are isolated in the Service layer, ensuring maximum testability and clean code.
* **Currency Precision:** Financial amounts are stored strictly as `Integers` (representing cents). This eliminates the floating-point math errors native to JavaScript and ensures absolute precision in financial aggregations.
* **Database Aggregation:** Dashboard metrics (Net Balance, Total Income, Category Distributions) are computed at the database layer using Prisma's `aggregate` and `groupBy` engines. This vastly reduces memory consumption on the Node server by offloading heavy math to PostgreSQL.
* **Soft Deletes:** Financial records are never permanently destroyed. A `deletedAt` timestamp is applied to maintain a historical audit trail while filtering out deleted records from active queries.
* **Global Error Handling:** A centralized error middleware catches unhandled exceptions, preventing server crashes, sanitizing stack traces in production, and standardizing error responses.

## 2. Security & Role-Based Access Control (RBAC)

Security is implemented at the middleware level, intercepting and verifying requests before they reach the controllers.

### Authentication (JWT)
* Users authenticate via the `POST /api/auth/login` endpoint, which returns a stateless JSON Web Token (JWT).
* The `verifyToken` middleware extracts this token from the `Authorization: Bearer <token>` header, verifies its cryptographic signature, and attaches the `userId` and `role` to the Express `req` object.

### Role-Based Access Control (RBAC)
Permissions are enforced using a dedicated `requireRole(allowedRoles[])` middleware wrapper.
* **`VIEWER`:** Read-only access. Can view the dashboard summaries and their own paginated records. Cannot create, update, or delete data.
* **`ANALYST`:** Standard access. Can view summaries, view records, and add new financial transactions (Income/Expenses).
* **`ADMIN`:** Full access. Can perform all the above, plus soft-delete records and manage user access.

### Data Validation (Zod)
All incoming payloads are validated against strict Zod schemas using a `validateData` middleware. Invalid data (e.g., missing fields, string instead of integer) is rejected immediately with detailed `400 Bad Request` responses, preventing malformed data from reaching the database.

## 3. Database Schema

The database is built on PostgreSQL and managed via Prisma ORM.

### Entity Relationships
The schema consists of a one-to-many relationship: **One `User` has many `FinancialRecord`s.**

### Schema Breakdown
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // Hashed via bcrypt
  role      Role     @default(VIEWER) // Enum: VIEWER, ANALYST, ADMIN
  createdAt DateTime @default(now())
  records   FinancialRecord[]
}

model FinancialRecord {
  id        String    @id @default(uuid())
  amount    Int       // Stored in cents to prevent floating-point errors
  type      RecordType // Enum: INCOME, EXPENSE
  category  String    // e.g., "Salary", "Groceries", "Housing"
  date      DateTime
  notes     String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime? // Supports soft deletes
  userId    String
  user      User      @relation(fields: [userId], references: [id])
}
```

## 4. API Documentation & Testing

Detailed API endpoint testing can be done using the provided Postman Collection. See the attached `finance_api_postman_collection.json` file in the repository root for immediate import and execution. 

The collection includes pre-configured routes, request bodies, and an automated script that securely saves the JWT token upon login for seamless testing.

## 5. Local Setup & Installation

Follow these steps to run the backend service locally on your machine.

### Prerequisites
* **Node.js** (v18 or higher)
* **npm** or **yarn**
* A **PostgreSQL** database (Local or Cloud like Neon/Supabase)

### Step 1: Clone the Repository
```bash
git clone [https://github.com/yourusername/finance-dashboard-backend.git](https://github.com/yourusername/finance-dashboard-backend.git)
cd finance-dashboard-backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a `.env` file in the root directory and add the following variables. Replace the placeholder values with your actual database credentials and a secure secret.
```env
# Server Configuration
PORT=10000

# Database Connection (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/finance_db"

# JWT Secret for Authentication
JWT_SECRET="your_super_secret_jwt_key_here"
```

### Step 4: Database Setup (Prisma)
Initialize the Prisma client and push the schema to your connected PostgreSQL database to create the required tables (`User` and `FinancialRecord`).
```bash
npx prisma generate
npx prisma db push
```

### Step 5: Start the Server
You can start the server in development mode (with hot-reloading) or build it for production.

**Development Mode:**
```bash
npm run dev
```

**Production Build:**
```bash
npm run build
npm start
```

The API will now be running locally. You can use the provided Postman collection to test the endpoints.


## 6. API Endpoints Overview

Below is a high-level summary of the available REST endpoints. For detailed request/response schemas and testing, please import the included `finance_api_postman_collection.json` file.

### Authentication
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Create a new user account | Public |
| `POST` | `/api/auth/login` | Authenticate and receive a JWT | Public |

### Financial Records
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/records` | Create a new income/expense record | `ANALYST`, `ADMIN` |
| `GET` | `/api/records` | Fetch paginated records for the logged-in user | `VIEWER`, `ANALYST`, `ADMIN` |
| `DELETE` | `/api/records/:id` | Soft-delete a specific record | `ADMIN` |

### Dashboard
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/summary` | Get aggregated financial metrics and category totals | `VIEWER`, `ANALYST`, `ADMIN` |