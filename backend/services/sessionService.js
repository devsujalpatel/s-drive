import { redisClient } from "../lib/redis.js";


export const createUserSessionService = async (userId, sessionId) => {
  const redisKey = `session:${sessionId}`;
  const sessionExpiryTime = 60 * 60 * 24;

  await redisClient.json.set(
    redisKey,
    "$",
    {userId}
  );
  await redisClient.expire(redisKey, sessionExpiryTime);
};

export const deleteSessionServiceByUserId = async (userId) => {
  const sessionId = await redisClient.json.get(`user:${userId}`, { path: "$.sessionId" });
  const redisKey = `session:${sessionId}`;
  await redisClient.json.del(redisKey);
};

export const getSessionService = async (sessionId) => {
  const redisKey = `session:${sessionId}`;
  const session = await redisClient.json.get(redisKey);
  return session;
};

export const deleteSessionService = async (sessionId) => {
  const redisKey = `session:${sessionId}`;
  await redisClient.json.del(redisKey);
};