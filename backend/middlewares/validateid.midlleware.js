export default function validateId(req, res, next, id) {
  const UUID_V4_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!UUID_V4_REGEX.test(id)) {
    return res.status(400).json({ error: `Invalid ID: ${id}` });
  }
  next();
}
