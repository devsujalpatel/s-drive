import { redisClient } from "../lib/redis.js";

const MAX_DEVICES = 2;

export const createUserSessionService = async (userId, sessionId) => {
  const redisKey = `session:${sessionId}`;

  await redisClient.json.set(
    redisKey,
    "$",
    {userId}
  );
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