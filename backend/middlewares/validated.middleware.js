import isValidId from "../validators/validateId.js";

export default function validateId(_, res, next, id) {
  if (!isValidId(id)) {
    return res.status(400).json({ error: `Invalid ID: ${id}` });
  }
  next();
}
