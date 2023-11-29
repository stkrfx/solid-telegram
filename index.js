const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const http = require("http");

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const multer = require("multer");

const apiRouter = require("./router/api");
const fetchRouter = require("./router/fetch");
const adminRouter = require("./router/admin");
const server = http.createServer(app);
const User = require("./models/user");
const Content = require("./models/content");
const Transaciton = require("./models/transaction");

const socketIo = require("socket.io");
const Message = require("./models/message");
const io = socketIo(server);

mongoose
  .connect(
    "mongodb+srv://stkrfx:i574z7_SN4MMMes@duoverse.vhuehr8.mongodb.net/duoverse?retryWrites=true&w=majority"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

app.use(express.json());
app.use("/admin", adminRouter);
app.use("/api", apiRouter);
app.use("/fetch", fetchRouter);
app.set("view engine", "ejs");
app.use("/fetch", express.static("public"));
app.use(express.urlencoded({ extended: true }));

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

io.on("connection", (socket) => {
  socket.on("chat message", async (msg) => {
    console.log("hi", msg);
    io.emit("chat message", msg);
    const { profilePicture, mobileNumber, name, message, date } = msg;
    await new Message({
      profilePicture,
      mobileNumber,
      name,
      message,
      date: new Date(date),
    }).save();
    console.log("saved");
  });

  socket.on("user-joined", async (msg) => {
    io.emit("user-joined", msg);
  });
});

app.get("/", async (req, res) => {
  res.render("index");
});

app.get("/user", async (req, res) => {
  try {
    const user = await User.findById(new ObjectId(req.query.id));
    console.log(user);
    res.json(user);
  } catch (error) {
    console.log(error);
    res.json("Internal server error");
  }
});

app.get("/check-user", async (req, res) => {
  try {
    console.log(req.query.mobile);
    const user = await User.findOne({ mobileNumber: req.query.mobile });
    console.log(user);
    if (user) {
      res.json(user);
    } else {
      res.json(undefined);
    }
  } catch (error) {
    console.log(error);
    res.json("Internal server error");
  }
});

app.get("/check-username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.query.username });
    if (user) {
      res.json(user);
    } else {
      res.json(undefined);
    }
  } catch (error) {
    console.log(error);
    res.json("Internal server error");
  }
});

app.post(
  "/create-user",
  userUpload.single("profilePicture"),
  async (req, res) => {
    try {
      const { name, mobileNumber, username, bio, refferal } = req.body;

      let wallet = 0;
      // if (refferal) {
      //   const refferUser = await User.findOne({ mobile: refferal });
      //   if (refferUser) {
      //     const transaction = await new Transaciton({
      //       date: new Date(),
      //       user: refferUser._id,
      //       amount: 10,
      //       description: 'Reffer user'
      //       // type: String,
      //       // status: String,
      //       // title: String,
      //     }).save();
      //     refferUser.wallet = 10;
      //     refferUser.save();
      //     wallet = 10;
      //   }
      // }

      const user = await new User({
        profilePicture: `/user/${req.file.filename}`,
        name,
        mobileNumber,
        username,
        bio,
        wallet,
        registrationDate: new Date(),
      }).save();

      console.log(user);

      res.json(user);
    } catch (error) {
      console.log(error);
      res.json("Internal server error");
    }
  }
);

app.post("/create-reels", contentUpload.single("source"), async (req, res) => {
  const { user, title, description } = req.body;

  console.log(req.body);
  console.log(req.file);
  const content = await new Content({
    user,
    title,
    description,
    source: `/content/${req.file.filename}`,
  }).save();
});

server.listen(port, () => console.log(`http://localhost:${port}`));
