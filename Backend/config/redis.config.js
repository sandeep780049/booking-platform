import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config({ path: "./.env" });

// No-op stub used when Redis is not configured, so the app runs fine
// without a Redis instance (translation caching simply does nothing).
const createNoopRedis = () => ({
  isOpen: false,
  on: () => createNoopRedis(),
  connect: async () => {},
  quit: async () => {},
  get: async () => null,
  set: async () => {},
  setEx: async () => {},
  keys: async () => [],
  del: async () => {},
});

const redis = process.env.REDIS_HOST
  ? createClient({
      username: process.env.REDIS_USERNAME || 'default',
      password: process.env.REDIS_PASSWORD,
      socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 15198,
        // Some managed providers (e.g. Redis Cloud free tier) require TLS
        ...(process.env.REDIS_TLS === 'true' ? { tls: true } : {})
      }
    })
  : createNoopRedis();

if (process.env.REDIS_HOST) {
  redis.on('error', err => console.log('Redis Client Error', err));
  redis.on('connect', () => console.log('Redis Connected Successfully'));

  // Connect to Redis immediately when this module is imported
  (async () => {
    try {
      await redis.connect();
      console.log('Redis client connected');
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
    }
  })();

  // Graceful shutdown handler
  process.on('SIGINT', async () => {
    try {
      await redis.quit();
      console.log('Redis connection closed');
    } catch (error) {
      console.error('Error closing Redis connection:', error);
    }
  });
} else {
  console.log('Redis not configured (REDIS_HOST missing) — running without Redis cache');
}

export default redis;
