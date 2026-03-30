import express from "express";
import usersData from "../usersDB.json" with { type: "json" };
import checkAuth from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", async (req, res, next) => {
  const { name, email, password } = req.body;
  const db = req.db;

  try {
    const userCollection = db.collection("users");
    const foundUser = await userCollection.findOne({ email });
    if (foundUser) {
      return res.status(409).json({
        error: "User already exists",
        message:
          "A user with this email address already exists. Please try logging in or use a different email.",
      });
    }

    const dirCollection = db.collection("directories");

    const userRootDir = await dirCollection.insertOne({
      name: `root-${email}`,
      parentDirId: null,
      files: [],
      directories: [],
    });

    const rootDirId = userRootDir.insertedId;

    const createdUser = await userCollection.insertOne({
      name,
      email,
      password,
      rootDirId,
    });

    const userId = createdUser.insertedId;

    await dirCollection.updateOne({ _id: rootDirId }, { $set: { userId } });

    res.status(201).json({ message: "User Registered" });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const db = req.db;
    const userCollection = db.collection("users");
    const user = await userCollection.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    const userOid = user._id.toString();
    res.cookie("uid", userOid, {
      httpOnly: true,
      maxAge: 60 * 1000 * 60 * 24 * 7,
    });
    res.json({ message: "user logged in successfully" });
  } catch (error) {
    next(error);
  }
});

router.get("/", checkAuth, (req, res) => {
  res.status(200).json({
    name: req.user.name,
    email: req.user.email,
  });
});

router.post("/logout", (req, res) => {
  res.clearCookie("uid");
  res.status(204).end();
});

export default router;
