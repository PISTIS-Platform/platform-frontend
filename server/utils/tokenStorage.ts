import Redis from 'ioredis';

let redisClient: Redis | null = null;
const STORAGE_PREFIX = 'auth-tokens:';
const TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

// Initialize Redis client at runtime
function getRedisClient(): Redis | null {
    if (process.env.STORAGE_DRIVER !== 'redis') {
        return null; // Use filesystem fallback
    }

    if (!redisClient) {
        redisClient = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
            db: parseInt(process.env.REDIS_DB || '0'),
            lazyConnect: true,
        });
    }

    return redisClient;
}

interface TokenStorage {
    access_token: string;
    id_token: string;
    refresh_token: string;
    expires_at: number;
}

export async function setTokens(sessionId: string, tokens: TokenStorage): Promise<void> {
    const redis = getRedisClient();

    if (redis) {
        await redis.set(STORAGE_PREFIX + sessionId, JSON.stringify(tokens), 'EX', TTL_SECONDS);
    } else {
        const storage = useStorage<TokenStorage>('auth-tokens');
        await storage.setItem(sessionId, tokens);
    }
}

export async function getTokens(sessionId: string): Promise<TokenStorage | null> {
    const redis = getRedisClient();

    if (redis) {
        const data = await redis.get(STORAGE_PREFIX + sessionId);
        if (!data) return null;
        return JSON.parse(data);
    } else {
        const storage = useStorage<TokenStorage>('auth-tokens');
        return await storage.getItem(sessionId);
    }
}

export async function removeTokens(sessionId: string): Promise<void> {
    const redis = getRedisClient();

    if (redis) {
        await redis.del(STORAGE_PREFIX + sessionId);
    } else {
        const storage = useStorage<TokenStorage>('auth-tokens');
        await storage.removeItem(sessionId);
    }
}
