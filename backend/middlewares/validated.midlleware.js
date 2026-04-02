import { ObjectId } from "mongodb";

export default function validateId(req, res, next, id) {
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: `Invalid ID: ${id}` });
  }
  next();
}
