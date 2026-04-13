import { ObjectId } from "mongodb";

// Register
export const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;
  const db = req.db;

  const session = client.startSession();
  try {
    const userCollection = db.collection("users");
    const rootDirId = new ObjectId();
    const userId = new ObjectId();
    const foundUser = await userCollection.findOne({ email });
    if (foundUser) {
      return res.status(409).json({
        error: "User already exists",
        message:
          "A user with this email address already exists. Please try logging in or use a different email.",
      });
    }

    const dirCollection = db.collection("directories");

    // Start Transactions

    session.startTransaction();

    await dirCollection.insertOne(
      {
        _id: rootDirId,
        name: `root-${email}`,
        parentDirId: null,
        userId,
      },
      { session },
    );

    await userCollection.insertOne(
      {
        _id: userId,
        name,
        email,
        password,
        rootDirId,
      },
      { session },
    );

    session.commitTransaction();

    res.status(201).json({ message: "User Registered" });
  } catch (err) {
    session.abortTransaction();
    if (err.code === 121) {
      return res.status(400).json({
        error: "Invalid Fields, please check your input and try again.",
      });
    } else {
      next(err);
    }
  }
};

// Login
export const loginUser = async (req, res, next) => {
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
};

// Get User
export const getUser = (req, res) => {
  res.status(200).json({
    name: req.user.name,
    email: req.user.email,
  });
};

// Logout
export const logoutUser = async (req, res, next) => {
  try {
    res.clearCookie("uid");
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Logout Failed" });
    next(error);
  }
};
