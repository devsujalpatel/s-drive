import usersData from "../../usersDB.json" with { type: "json" };

export function checkAuth(req, res, next) {
  const userId = req.cookies?.uid;
  try {
    const user = usersData.find((user) => user.id === userId);

    if (!userId || !user) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
