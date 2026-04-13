import { rm } from "fs/promises";
import { ObjectId } from "mongodb";
import Directory from "../models/directory.model.js";
import File from "../models/file.model.js";

// Read
export const getDirectory = async (req, res, next) => {
  try {
    const user = req.user;
    const _id = req.params.id ? new ObjectId(req.params.id) : user.rootDirId;

    const directoryData = await Directory.findOne({
      _id,
    }).lean();

    if (!directoryData) {
      return res.status(404).json({
        error: "Directory not found or you do not have access to it!",
      });
    }

    const directories = await Directory.find({
      parentDirId: directoryData._id,
    }).lean();

    // const files = await fileCollection.find({ directoryId: id }).toArray();
    const files = await File.find({
      parentDirId: directoryData._id,
    })
      .lean()
      .exec();

    return res.status(200).json({
      ...directoryData,
      files: files.map((file) => ({ ...file, id: file._id })),
      directories: directories.map((dir) => ({ ...dir, id: dir._id })),
    });
  } catch (error) {
    next(error);
  }
};

// Create
export const createDirectory = async (req, res, next) => {
  const user = req.user;
  const parentDirId = req.params.id
    ? new ObjectId(req.params.id)
    : user.rootDirId;
  const dirname = req.headers.dirname || "New Folder";

  try {
    const parentDir = await Directory.findOne({
      _id: parentDirId,
    }).lean();

    if (!parentDir)
      return res
        .status(404)
        .json({ message: "Parent Directory Does not exist!" });

    await Directory.create({
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

// Update
export const updateDirectory = async (req, res, next) => {
  const user = req.user;
  const { id } = req.params;
  if (!id)
    return res.status(400).json({ message: "Directory ID is required!" });
  const { newDirName } = req.body;

  try {
    await Directory.findOneAndUpdate(
      { _id: new ObjectId(id), userId: user._id },
      { $set: { name: newDirName } },
    );
    res.status(200).json({ message: "Directory Renamed!" });
  } catch (err) {
    next(err);
  }
};

// Delete
export const deleteDirectory = async (req, res, next) => {
  const user = req.user;
  const { id } = req.params;

  try {
    const dirObjectId = new ObjectId(String(id));
    const directory = await Directory.findOne(
      {
        _id: dirObjectId,
        userId: user._id,
      },
      {
        _id: 1,
      },
    ).lean();

    if (!directory) {
      return res.status(404).json({
        message: "Directory not found or you do not have access to it!",
      });
    }

    async function getDirectoryContents(id) {
      let files = await File.find(
        {
          parentDirId: id,
        },
        { projection: { extension: 1 } },
      )
        .lean()
        .exec();
      let directories = await Directory.find(
        {
          parentDirId: id,
        },
        { projection: { _id: 1 } },
      )
        .lean()
        .exec();

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

    await File.deleteMany({
      _id: { $in: files.map(({ _id }) => _id) },
    });
    await Directory.deleteMany({
      _id: { $in: [...directories.map(({ _id }) => _id), dirObjectId] },
    });

    res.status(200).json({ message: "Directory Deleted!" });
  } catch (err) {
    next(err);
  }
};
