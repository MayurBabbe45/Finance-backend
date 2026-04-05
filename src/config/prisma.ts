import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

// 1. Create a connection pool using the native 'pg' driver
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

// 2. Wrap the pool in the Prisma Postgres adapter
const adapter = new PrismaPg(pool);

// 3. Initialize Prisma Client with the adapter
const prisma = new PrismaClient({ adapter });

export default prisma;