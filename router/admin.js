const router = require("express").Router();
const multer = require("multer");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

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
const Contest = require("../models/contest");
const Category = require("../models/category");

// router.get("/contest", (req, res) => {
//   res.render("home");
// });

router.get("/category", async (req, res) => {
  const categories = await Category.find();
  res.render("home", { categories });
});

router.post(
  "/create-contest",
  contestUpload.single("poster"),
  async (req, res) => {
    try {
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
        totalSpots,
        rules,
      } = req.body;

      res.json(
        (
          await new Contest({
            date,   
            poster: `/contest/${req.file.filename}`,
            category,
            username,
            password,
            map,
            prize,
            entry,
            type,
            perKill,
            totalSpots,
            leftSpots: totalSpots,
            rules,
          }).save()
        )._id
      );
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.post(
  "/create-category",
  categoryUpload.single("icon"),
  async (req, res) => {
    try {
      const category = await new Category({
        icon: `/category/${req.file.filename}`,
        title: req.body.title,
      }).save();
      res.json(category);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

module.exports = router;
