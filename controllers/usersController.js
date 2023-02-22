const User = require("../model/User");
const Groups = require("../model/Group");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const getAllUsers = async (req, res) => {
  const users = await User.find().select("_id name surname studentNumber roles");;
  if (!users) return res.status(204).json({ message: "No users found" });
  res.json(users);
};

const deleteUser = async (req, res) => {
  if (!req?.body?.id)
    return res.status(400).json({ message: "User ID required" });
  const user = await User.findOne({ _id: req.body.id }).exec();
  if (!user) {
    return res
      .status(204)
      .json({ message: `User ID ${req.body.id} not found` });
  }
  const result = await user.deleteOne({ _id: req.body.id });
  res.json(result);
};

const getUser = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "User ID required" });
  const user = await User.findOne({ _id: req.params.id }).exec();
  if (!user) {
    return res
      .status(204)
      .json({ message: `User ID ${req.params.id} not found` });
  }
  res.json(user);
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.params.id;
    const userStoragePath = path.join(
      process.env.STORAGE_PATH,
      "user_storage",
      userId
    );

    if (!fs.existsSync(userStoragePath)) {
      fs.mkdirSync(userStoragePath);
    }
    cb(null, userStoragePath);
  },
  filename: function (req, file, cb) {
    cb(null, `profile_picture.${file.mimetype.split("/")[1]}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only images are allowed"));
  }

  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024, // 1 MB
  },
}).single("profilePicture");

const uploadProfilePicture = async (req, res, err) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).send({ error: err.message });
    } else if (err) {
      return res.status(400).send({ error: err.message });
    }
    try {
      const userId = req.params.id;
      const profilePicture = req.file;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      user.picture = `storage/user_storage/${user.id}/${profilePicture.filename}`;
      await user.save();

      res.send(user.picture);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  });
};

const getUserGroups = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "User ID required" });
    const user = await User.findOne({ _id: req.params.id }).exec();
    if(!user) {
        res.status(404).json({ message: "No user found" });
    }
  try {
    const groups = await Groups.find({ studentIds: req.params.id });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving groups" });
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  getUser,
  uploadProfilePicture,
  getUserGroups
};
