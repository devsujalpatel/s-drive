import Session from "../models/session.model.js";

const MAX_DEVICES = 2;

export const createUserSessionService = async (userId) => {
  const allSessions = await Session.find({ userId }).sort({
    createdAt: 1,
  });
  if (allSessions.length >= MAX_DEVICES) {
    await allSessions[0].deleteOne();
  }

  const userSession = await Session.create(
    {
      userId
    },
  );
  return userSession;
};
