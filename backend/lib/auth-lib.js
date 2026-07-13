export const allowRoles = (roles) => {
  return (req, res, next) => {
    if (roles.includes(req.user.role)) {
      return next();
    }
    return res.status(401).json({
      message: "Unauthorized",
    });
  };
}