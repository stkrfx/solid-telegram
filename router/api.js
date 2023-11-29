const router = require("express").Router();
const multer = require("multer");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const ffmpeg = require("fluent-ffmpeg");

const User = require("../models/user");
const Content = require("../models/content");
const Comment = require("../models/comment");
const Contest = require("../models/contest");
const Category = require("../models/category");

const categoryUpload = multer({
  storage: multer.diskStorage({
    destination: "public/category",
    filename: (_, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  }),
});

const contestUpload = multer({
  storage: multer.diskStorage({
    destination: "public/contest",
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

const userUpload = multer({
  storage: multer.diskStorage({
    destination: "public/user",
    filename: (_, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  }),
});

router.get("/ad", async (req, res) => {
  const ad = await Content.findById(new ObjectId("655d9ecf835374cbf4c39cc4"));
  const user = await User.findById(new ObjectId(ad.user));
  res.json({ ...ad.toObject(), ...user.toObject(), ad: true });
});

router.get("/user", async (req, res) => {
  const user = await User.findById(req.query.id);
  console.log(user);
  res.json(user);
});

router.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

router.post("/user", userUpload.single("profilePicture"), async (req, res) => {
  const {
    name,
    mobileNumber,
    username,
    bio,
    email,
    birthday,
    gender,
    website,
    refferal,
  } = req.body;

  res.json(
    (
      await new User({
        profilePicture: `/user/${req.file.filename}`,
        name,
        mobileNumber,
        username,
        bio,
        email,
        birthday,
        gender,
        website,
        refferal,
        registrationDate: new Date(),
      }).save()
    )._id
  );
});

router.post(
  "/edit-user",
  userUpload.single("profilePicture"),
  async (req, res) => {
    const user = await User.findById(new ObjectId(req.query.id));
    const { name, username, bio, email, birthday, gender, website } = req.body;

    if (req.file) {
      user.profilePicture = `/user/${req.file.filename}`;
    }

    user.name = name;
    user.username = username;
    user.bio = bio;
    user.email = email;
    user.birthday = birthday;
    user.gender = gender;
    user.website = website;

    res.json((await user.save())._id);
  }
);

router.get("/block-user", async (req, res) => {
  const user = await User.findById(new ObjectId(req.query.id));
  user.blocked = !user.blocked;
  res.json((await user.save())._id);
});

router.get("/verify-user", async (req, res) => {
  const user = await User.findById(new ObjectId(req.query.id));
  user.verified = !user.verified;
  res.json((await user.save())._id);
});

router.get("/all-reported-user", async (req, res) => {
  const sortedUsers = await User.aggregate([
    {
      $match: {
        "reported.0": { $exists: true },
      },
    },
    {
      $project: {
        _id: 1,
        username: 1,
        // Add other fields you want to include in the result
        reportedCount: { $size: "$reported" }, // Calculate reported count
      },
    },
    {
      $sort: { reportedCount: -1 }, // Sort in descending order based on reported count
    },
  ]);

  res.json(sortedUsers);
});

router.get("/report-user", async (req, res) => {
  const user = await User.findById(new ObjectId(req.query.id));
  if (!user.reported.includes(req.query.user)) {
    user.reported.push(req.query.user);
    await user.save();
  }
  res.json(user._id);
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

router.get("/user-contents", async (req, res) => {
  const skip = parseInt(req.query.skip) || 0;
  const contents = await Content.find({
    user: req.query.user,
    type: req.query.type,
  })
    .limit(10)
    .skip(skip);
  res.json(contents);
});

router.get("/random-contents", async (req, res) => {
  console.log("hi");
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
});

router.get("/all-contents", async (req, res) => {
  const contents = await Content.find();
  res.json(contents);
});

router.get("/content", async (req, res) => {
  const content = await Content.findById(new ObjectId(req.query.id));
  const user = await User.findById(new ObjectId(content.user));
  res.json({ content, user });
});

router.post(
  "/content",
  contentUpload.fields([
    { name: "source", maxCount: 1 },
    { name: "poster", maxCount: 1 },
  ]),
  async (req, res) => {
    const { user, type, title, description, youtubeVideo } = req.body;

    const videoBuffer = req.files["source"][0].buffer;

    let videoInfo;

    await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoBuffer, (err, metadata) => {
        if (err) {
          console.error("Error analyzing video: " + err.message);
          reject(err);
        } else {
          videoInfo = metadata.format;
          resolve();
        }
      });
    });

    res.json(
      (
        await new Content({
          user,
          type,
          title,
          description,
          youtubeVideo,
          date: new Date(),
          duration: videoInfo.duration,
          source: `/content/${req.files["source"][0].filename}`,
          poster: `/content/${req.files["poster"][0].filename}`,
        }).save()
      )._id
    );
  }
);

router.post(
  "edit-content",
  contentUpload.fields([
    { name: "source", maxCount: 1 },
    { name: "poster", maxCount: 1 },
  ]),
  async (req, res) => {
    const content = await Content.findById(new ObjectId(req.query.id));
    const { title, description, youtubeVideo } = req.body;

    if (req.files["source"]) {
      const videoBuffer = req.files["source"][0].buffer;

      let videoInfo;

      await new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoBuffer, (err, metadata) => {
          if (err) {
            console.error("Error analyzing video: " + err.message);
            reject(err);
          } else {
            videoInfo = metadata.format;
            resolve();
          }
        });
      });
      content.duration = videoInfo.duration;
      content.source = `/content/${req.files["source"][0].filename}`;
    }

    if (req.files["poster"]) {
      content.poster = `/content/${req.files["poster"][0].filename}`;
    }

    content.title = title;
    content.description = description;
    content.youtubeVideo = youtubeVideo;

    res.json((await content.save())._id);
  }
);

router.get("/like-content", async (req, res) => {
  const { user } = req.query;
  const content = await Content.findById(new ObjectId(req.query.id));
  const index = content.likes.indexOf(user);
  index !== -1 ? content.likes.splice(index, 1) : content.likes.push(user);
  res.json((await content.save())._id);
});

router.get("/report-content", async (req, res) => {
  const content = await Content.findById(new ObjectId(req.query.id));
  if (!content.reported.includes(req.query.user)) {
    content.reported.push(req.query.user);
    await content.save();
  }
  res.json(content._id);
});

router.get("/all-reported-content", async (req, res) => {
  const sortedContents = await Content.aggregate([
    {
      $match: {
        "reported.0": { $exists: true },
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        // Add other fields you want to include in the result
        reportedCount: { $size: "$reported" }, // Calculate reported count
      },
    },
    {
      $sort: { reportedCount: -1 }, // Sort in descending order based on reported count
    },
  ]);

  res.json(sortedContents);
});

router.get("/view-content", async (req, res) => {
  const content = await Content.findById(new ObjectId(req.query.id));
  if (!content.views.includes(req.query.user)) {
    content.views.push(req.query.user);
    await content.save();
  }
  res.json(content._id);
});

router.get("/delete-content", async (req, res) => {
  await Content.findByIdAndDelete(new ObjectId(req.query.id));
  res.json("Content deleted successfully");
});

router.get("/contests", async (req, res) => {
  const skip = parseInt(req.query.skip) || 0;
  const contests = await Contest.find().limit(10).skip(skip).sort({ date: 1 });
  res.json(contests);
});

router.get("/all-contests", async (req, res) => {
  const contests = await Contest.find().sort({ date: 1 });
  res.json(contests);
});

router.get("/contest", async (req, res) => {
  const contest = await Contest.findById(new ObjectId(req.query.id));
  res.json(contest);
});

router.post("/contest", contestUpload.single("poster"), async (req, res) => {
  const {
    date,
    category,
    username,
    password,
    map,
    prize,
    entry,
    type,
    perKill,
    content,
    totalSpots,
    rules,
    ranking,
  } = req.body;

  let poster;
  if (req.file) {
    poster = `/contest/${req.file.filename}`;
  } else {
    const category = await Category.findById(new ObjectId(category));
    const posters = category.posters;
    poster = posters[Math.floor(Math.random() * posters.length)];
  }

  res.json(
    (
      await new Contest({
        date: new Date(),
        poster,
        category,
        username,
        password,
        map,
        prize,
        entry,
        type,
        perKill,
        content,
        totalSpots,
        leftSpots: totalSpots,
        rules,
        ranking: ranking?.split(","),
      }).save()
    )._id
  );
});

router.post(
  "/edit-contest",
  contestUpload.single("poster"),
  async (req, res) => {
    const {
      date,
      category,
      username,
      password,
      map,
      prize,
      entry,
      type,
      perKill,
      content,
      totalSpots,
      rules,
      ranking,
    } = req.body;

    const contest = await Contest.findById(new ObjectId(req.query.id));

    let poster;
    if (req.file) {
      poster = `/contest/${req.file.filename}`;
    } else {
      const category = await Category.findById(new ObjectId(category));
      const posters = category.posters;
      poster = posters[Math.floor(Math.random() * posters.length)];
    }

    category.date = date;
    category.poster = poster;
    category.category = category;
    category.username = username;
    category.password = password;
    category.map = map;
    category.prize = prize;
    category.entry = entry;
    category.type = type;
    category.perKill = perKill;
    category.content = content;
    category.totalSpots = totalSpots;
    category.leftSpots = leftSpots;
    category.rules = rules;
    category.ranking = ranking.split(",");

    res.json((await contest.save())._id);
  }
);

router.get("/join-contest", async (req, res) => {
  const contest = await Contest.findById(new ObjectId(req.query.id));
  const user = await User.findById(new ObjectId(req.query.user));
  const { gameId } = req.query;

  if (
    contest.leftSpots > 0 &&
    !user.contestHistory.includes(contest._id) &&
    user.walletBalance >= contest.entry
  ) {
    user.contestHistory.push(contest._id);
    user.walletBalance = user.walletBalance - contest.entry;
    contest.leftSpots = contest.leftSpots - 1;
    contest.users.push({
      user: user._id,
      gameId,
    });

    await contest.save();
    await user.save();
  }

  res.json("Match joined successfully");
});

router.get("/delete-contest", async (req, res) => {
  await Contest.findByIdAndDelete(new ObjectId(req.query.id));
  res.json("Contest deleted successfully");
});

router.get("/categories", async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

router.get("/category", async (req, res) => {
  const category = await Category.findById(new ObjectId(req.query.id));
  res.json(category);
});

router.post(
  "/category",
  categoryUpload.fields([
    { name: "icon", maxCount: 1 },
    { name: "posters", maxCount: 5 },
  ]),
  async (req, res) => {
    console.log(req.body); // Log the entire request body
    console.log(req.files); // Log the files received
    const icon = req.files["icon"][0].filename; // Use [0] because it's a single file
    const posters = req.files["posters"].map((file) => file.filename);
    res.json(
      (
        await new Category({
          title: title,
          icon: icon,
          posters: posters,
        }).save()
      )._id
    );
  }
);

// need some improvement
router.post(
  "/edit-category",
  categoryUpload.fields([
    { name: "icon", maxCount: 1 },
    { name: "posters", maxCount: 10 },
  ]),
  async (req, res) => {
    const category = await Category.findById(new ObjectId(req.query.id));
    category.title = req.body.title;
    if (req.files["icon"]) {
      category.icon = `/category/${req.files["icon"][0].filename}`;
    }

    res.json((await category.save())._id);
  }
);

router.get("/delete-category", async (req, res) => {
  await Category.findByIdAndDelete(new ObjectId(req.query.id));
  res.json("Category deleted successfully");
});

router.get("/check-for-update", (req, res) => {
  // res.json({type: 'updating'});
  res.json({ type: "updated", version: 1 });
});

// router.post("/user", upload.single("profilePicture"), async (req, res) => {
//   try {
//     const { name, mobile, username } = req.body;
//     res.json(
//       (
//         await new User({
//           profilePicture: `/uploads/${req.file.filename}`,
//           name,
//           mobile,
//           username,
//           registrationDate: new Date(),
//         }).save()
//       )._id
//     );
//   } catch (error) {
//     console.error(error);
//     res.json({ error: "Internal Server Error" });
//   }
// });

module.exports = router;
