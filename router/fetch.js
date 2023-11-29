const router = require("express").Router();
const multer = require("multer");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const User = require("../models/user");
const Content = require("../models/content");
const Comment = require("../models/comment");
const Contest = require("../models/contest");
const Category = require("../models/category");
const Message = require("../models/message");
const Transaction = require("../models/transaction");

const userUpload = multer({
  storage: multer.diskStorage({
    destination: "public/user",
    filename: (_, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  }),
});

const contentUpload = multer({
  storage: multer.diskStorage({
    destination: "public/content",
    filename: (_, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  }),
});

// get all the data needed on app load
router.get("/get-user", async (req, res) => {
  try {
    console.log("hi");
    res.json(await User.findById(new ObjectId(req.query.id)));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// get all messages from backend
router.get("/messages", async (req, res) => {
  try {
    console.log("hi");
    const messages = await Message.find();
    console.log(messages);
    res.json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/like", async (req, res) => {
  const { user } = req.query;
  console.log("hi");
  const content = await Content.findById(new ObjectId(req.query.id));
  const index = content.likes.indexOf(user);
  index !== -1 ? content.likes.splice(index, 1) : content.likes.push(user);
  res.json((await content.save())._id);
});

router.get("/follow-user", async (req, res) => {
  const { following, follower } = req.query;
  const followingUser = await User.findById(new ObjectId(following));
  const followerUser = await User.findById(new ObjectId(follower));
  const indexFollower = followingUser.following.indexOf(follower);
  indexFollower !== -1
    ? followingUser.following.splice(indexFollower, 1)
    : followingUser.following.push(follower);
  const indexFollowing = followerUser.followers.indexOf(following);
  indexFollowing !== -1
    ? followerUser.followers.splice(indexFollowing, 1)
    : followerUser.followers.push(following);

  await followingUser.save();
  await followerUser.save();

  res.json("User followed successfully");
});

// check username available or not
router.get("/check-username", async (req, res) => {
  try {
    res.json(await User.findOne({ username: req.query.username }));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post(
  "/create-user",
  userUpload.single("profilePicture"),
  async (req, res) => {
    try {
      const { username, mobileNumber } = req.body;
      let profilePicture = "/user/profile-picture.jpg";
      if (req.file) {
        profilePicture = `/user/${req.file.filename}`;
      }
      const user = await new User({
        profilePicture,
        username,
        mobileNumber,
      }).save();
      res.json(user);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get("/get-contests", async (req, res) => {
  try {
    const contents = await Contest.find();
    res.json(contents);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/contest", async (req, res) => {
  try {
    const contest = await Contest.findById(new ObjectId(req.query.id));

    res.json(contest);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get('/join', async (req,res)=>{
  try {
    const contest = await Contest.findById(req.query.id)
    // contest.push()
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
})

router.get("/random-contents", async (req, res) => {
  try {
    const contents = await Content.aggregate([
      { $match: { type: req.query.type } },
      { $sample: { size: 10 } },
      {
        $lookup: {
          from: "users",
          let: { userId: "$user" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toString: "$_id" }, "$$userId"],
                },
              },
            },
          ],
          as: "userDetails",
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              "$$ROOT",
              {
                username: "$userDetails.username",
                profilePicture: "$userDetails.profilePicture",
                verified: "$userDetails.verified",
              },
            ],
          },
        },
      },
    ]).exec();
    res.json(contents);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post(
  "/edit-user-profile-picture",
  userUpload.single("profilePicture"),
  async (req, res) => {
    try {
      const user = await User.findById(new ObjectId(req.query.id));
      let profilePicture = "/user/profile-picture.jpg";
      if (req.file) {
        profilePicture = `/user/${req.file.filename}`;
      }
      user.profilePicture = profilePicture;
      user.save();
      res.json(user);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.post(
  "/create-content",
  contentUpload.fields([
    { name: "source", maxCount: 1 },
    { name: "poster", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      console.log("jh");
      const { type, user, duration, title, description } = req.body;

      const content = await new Content({
        user,
        type,
        title,
        description,
        date: new Date(),
        duration: duration,
        source: `/content/${req.files["source"][0].filename}`,
        poster: `/content/${req.files["poster"][0].filename}`,
      }).save();

      res.json(content);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get("/content", async (req, res) => {
  try {
    const content = await Content.findById(new ObjectId(req.query.id));
    const user = await User.findById(new ObjectId(content.user));
    if (!content.views?.includes(req.query.user)) {
      content.views?.push(req.query.user);
      content.comments = 0;
      console.log(content.views);
      await content.save();
    }
    console.log(content.views.length);
    res.json({ ...content.toObject(), ...user.toObject() });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/report", async (req, res) => {
  try {
    const content = await Content.findById(new ObjectId(req.query.id));
    if (!content.reported.includes(req.query.user)) {
      content.reported.push(req.query.user);
      await content.save();
    }
    res.json(content._id);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/add-to-watch-later", async (req, res) => {
  try {
    const user = await User.findById(new ObjectId(req.query.id));
    if (!user.watchLater.includes(req.query.content)) {
      user.watchLater.push(req.query.content);
      await user.save();
    }
    res.json(user._id);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/follow", async (req, res) => {
  try {
    const creator = await User.findById(new ObjectId(req.query.contentUser));
    const watcher = await User.findById(new ObjectId(req.query.watchingUser));

    creator.following.push(wa);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/follow", async (req, res) => {
  const { contentUser, watchingUser } = req.query;
  const followingUser = await User.findById(new ObjectId(contentUser));
  const followerUser = await User.findById(new ObjectId(watchingUser));
  const indexFollower = followingUser.following.indexOf(watchingUser);
  indexFollower !== -1
    ? followingUser.following.splice(indexFollower, 1)
    : followingUser.following.push(watchingUser);
  const indexFollowing = followerUser.followers.indexOf(contentUser);
  indexFollowing !== -1
    ? followerUser.followers.splice(indexFollowing, 1)
    : followerUser.followers.push(contentUser);

  await followingUser.save();
  await followerUser.save();

  res.json("User followed successfully");
});

router.post(
  "/edit-profile",
  userUpload.single("profilePicture"),
  async (req, res) => {
    try {
      const { username, email, bio, name } = req.body;
      const user = await User.findById(new ObjectId(req.query.id));
      if (username) {
        user.username = username;
      }
      if (email) {
        user.email = email;
      }
      if (bio) {
        user.bio = bio;
      }
      if (name) {
        user.name = name;
      }
      if (req.file) {
        user.profilePicture = `/user/${req.file.filename}`;
      }
      await user.save();
      res.json(user);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get("/search", async (req, res) => {
  try {
    const searchTerm = req.query.search;

    if (!searchTerm) {
      return res.status(400).json({ error: "Search term is missing" });
    }
    const results = await Content.find(
      { $text: { $search: searchTerm } },
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } });

    res.json(results);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find().sort({ weekEarning: -1 }).limit(100);
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/create-transaction", async (req, res) => {
  const { user, amount, transsactionId, stauts, upi } = req.body;

  const transaction = await new Transaction({
    date: new Date(),
    user,
    amount,
    transsactionId,
    upi,
    stauts,
  }).save();

  res.json(transaction);
});

router.get("/check-number", async (req, res) => {
  try {
    const user = await User.findOne({ mobileNumber: req.query.mobile });
    if (user) {
      res.json({ ...user.toObject(), exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
