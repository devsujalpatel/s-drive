import { rm } from "fs/promises";
import { ObjectId } from "mongodb";


// Read
export const getDirectory = async (req, res, next) => {
  try {
    const db = req.db;
    const user = req.user;
    const _id = req.params.id ? new ObjectId(req.params.id) : user.rootDirId;
    const dirCollection = db.collection("directories");
    const fileCollection = db.collection("files");

    const directoryData = await dirCollection.findOne({
      _id,
    });

    if (!directoryData) {
      return res.status(404).json({
        error: "Directory not found or you do not have access to it!",
      });
    }

    const directories = await dirCollection
      .find({ parentDirId: _id })
      .toArray();

    // const files = await fileCollection.find({ directoryId: id }).toArray();
    const files = await fileCollection
      .find({
        parentDirId: directoryData._id,
      })
      .toArray();

    return res.status(200).json({
      ...directoryData,
      files: files.map((file) => ({ ...file, id: file._id })),
      directories: directories.map((dir) => ({ ...dir, id: dir._id })),
    });
  } catch (error) {
    next(error);
  }
};

export const createDirectory = async (req, res, next) => {
  const user = req.user;
  const parentDirId = req.params.id
    ? new ObjectId(req.params.id)
    : user.rootDirId;
  const dirname = req.headers.dirname || "New Folder";
  const db = req.db;

  try {
    const dirCollection = db.collection("directories");

    const parentDir = await dirCollection.findOne({
      _id: parentDirId,
    });

    if (!parentDir)
      return res
        .status(404)
        .json({ message: "Parent Directory Does not exist!" });

    await dirCollection.insertOne({
      name: dirname,
      parentDirId,
      userId: user._id,
    });

    return res.status(201).json({ message: "Directory Created!" });
  } catch (err) {
    if (err.code === 121) {
      return res.status(400).json({
        error: "Invalid Fields, please check your input and try again.",
      });
    } else {
      next(err);
    }
  }
};

export const updateDirectory = async (req, res, next) => {
  const user = req.user;
  const db = req.db;
  const { id } = req.params;
  if (!id)
    return res.status(400).json({ message: "Directory ID is required!" });
  const { newDirName } = req.body;

  try {
    const dirCollection = db.collection("directories");

    await dirCollection.updateOne(
      { _id: new ObjectId(id), userId: user._id },
      { $set: { name: newDirName } },
    );
    res.status(200).json({ message: "Directory Renamed!" });
  } catch (err) {
    next(err);
  }
}

export const deleteDirectory = async (req, res, next) => {
  const user = req.user;
  const { id } = req.params;
  const db = req.db;

  try {
    const dirCollection = db.collection("directories");
    const fileCollection = db.collection("files");

    const dirObjectId = new ObjectId(String(id));

    const directory = await dirCollection.findOne(
      {
        _id: dirObjectId,
        userId: user._id,
      },
      {
        _id: 1,
      },
    );

    if (!directory) {
      return res.status(404).json({
        message: "Directory not found or you do not have access to it!",
      });
    }

    async function getDirectoryContents(id) {
      let files = await fileCollection
        .find(
          {
            parentDirId: id,
          },
          { projection: { extension: 1 } },
        )
        .toArray();
      let directories = await dirCollection
        .find(
          {
            parentDirId: id,
          },
          { projection: { _id: 1 } },
        )
        .toArray();

      for (const { _id, name } of directories) {
        const { files: childFiles, directories: childDirectories } =
          await getDirectoryContents(new ObjectId(String(_id)));

        files = [...files, ...childFiles];
        directories = [...directories, ...childDirectories];
      }

      return { files, directories };
    }

    const { files, directories } = await getDirectoryContents(dirObjectId);

    for (const { _id, extension } of files) {
      await rm(`./storage/${_id.toString()}${extension}`);
    }

    await fileCollection.deleteMany({
      _id: { $in: files.map(({ _id }) => _id) },
    });
    await dirCollection.deleteMany({
      _id: { $in: [...directories.map(({ _id }) => _id), dirObjectId] },
    });

    res.status(200).json({ message: "Directory Deleted!" });
  } catch (err) {
    next(err);
  }
}

export default router;
