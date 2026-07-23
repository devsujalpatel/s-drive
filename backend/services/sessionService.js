import { redisClient } from "../lib/redis.js";


export const createUserSessionService = async (userId, sessionId) => {
  const redisKey = `session:${sessionId}`;
  const sessionExpiryTime = 60 * 60 * 24;
  const allSessions = await redisClient.ft.search(`userIdIdx`, `@userId:{${userId}}`, {
    RETURN: []
  });
  if (allSessions.total >= 2) {
    await redisClient.del(allSessions.documents[0].id);
  }
  await redisClient.json.set(
    redisKey,
    "$",
    {userId}
  );
  await redisClient.expire(redisKey, sessionExpiryTime);
};

export const deleteSessionServiceByUserId = async (userId) => {
 // delete all sessions for the user
  const allSessions = await redisClient.ft.search(`userIdIdx`, `@userId:{${userId}}`, {
    RETURN: []
  });
  for (const session of allSessions.documents) {
    await redisClient.del(session.id);
  }
};

export const getSessionService = async (sessionId) => {
  const redisKey = `session:${sessionId}`;
  const session = await redisClient.json.get(redisKey);
  return session;
};

export const deleteSessionService = async (userId) => {
  const allSessions = await redisClient.ft.search(`userIdIdx`, `@userId:{${userId}}`, {
    RETURN: []
  });
  if (allSessions.total >= 2) {
    await redisClient.del(allSessions.documents[allSessions.total - 1].id);
  }
};
