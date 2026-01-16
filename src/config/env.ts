import dotenv from 'dotenv';

dotenv.config();

const port = Number(process.env.PORT) || 3000;
const databaseUrl = process.env.DATABASE_URL;
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}
if (!jwtSecret) {
  throw new Error('JWT_SECRET is not set');
}

export const env = {
  port,
  databaseUrl,
  jwtSecret,
  jwtExpiresIn,
};
