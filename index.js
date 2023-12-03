const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const http = require("http");

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const multer = require("multer");

const ytdl = require("ytdl-core");

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


const shorts = [
  {
    title: "The reason you know 🌝💛 @JONATHANGAMINGYT",
    thumbnail:
      "https://i.ytimg.com/vi/RXKYdDlOcqw/oardefault.jpg?sqp=-oaymwEkCJUDENAFSFqQAgHyq4qpAxMIARUAAAAAJQAAyEI9AICiQ3gB&rs=AOn4CLCGZOxPoDYMJPKZBoBTxwIyCPx02A",
    videoId: "RXKYdDlOcqw",
  },
  {
    title: "Fan Favourite Esports Player 😈🔥 @JONATHANGAMINGYT",
    thumbnail:
      "https://i.ytimg.com/vi/nsZuyPPCB34/hq720.jpg?sqp=-oaymwEkCJUDENAFSFryq4qpAxYIARUAAAAAJQAAyEI9AICiQ3gB0AEB&rs=AOn4CLAmRuhJ7WT8s50uds0LGrxCjPFQhg",
    videoId: "nsZuyPPCB34",
  },
  {
    title: "The Cutest gamer of IGC 🐐 @JONATHANGAMINGYT",
    thumbnail:
      "https://i.ytimg.com/vi/njijZPwDFlc/oar2.jpg?sqp=-oaymwEkCJUDENAFSFqQAgHyq4qpAxMIARUAAAAAJQAAyEI9AICiQ3gB&rs=AOn4CLBWLGeaDRZDTYHZqqI02RJf9XXoMg",
    videoId: "njijZPwDFlc",
  },
  {
    title: "Godlike 💔 @GodLikeEsportss",
    thumbnail:
      "https://i.ytimg.com/vi/PHsYTTI2FdM/oar2.jpg?sqp=-oaymwEkCJUDENAFSFqQAgHyq4qpAxMIARUAAAAAJQAAyEI9AICiQ3gB&rs=AOn4CLBswcWgnp2XDx6ANmX1cuGyhY4CYw",
    videoId: "PHsYTTI2FdM",
  },
  {
    title: "Khabe hath trophy check kr 😏 @JONATHANGAMINGYT",
    thumbnail:
      "https://i.ytimg.com/vi/t4SBG_mcqu4/oar2.jpg?sqp=-oaymwEkCJUDENAFSFqQAgHyq4qpAxMIARUAAAAAJQAAyEI9AICiQ3gB&rs=AOn4CLDX-9hr-VIdqvNbsXrYerQN0fBKNQ",
    videoId: "t4SBG_mcqu4",
  },
  {
    title: "Elf set Supermacy 👿 @JONATHANGAMINGYT",
    thumbnail:
      "https://i.ytimg.com/vi/Lm8pVvbawHg/oar2.jpg?sqp=-oaymwEkCJUDENAFSFqQAgHyq4qpAxMIARUAAAAAJQAAyEI9AICiQ3gB&rs=AOn4CLBH_WIjSgIdos9pp4GY3mkdNnK03w",
    videoId: "Lm8pVvbawHg",
  },
  {
    title: "Systumm hai Jonny Bhai ka 😮‍💨 @JONATHANGAMINGYT",
    thumbnail:
      "https://i.ytimg.com/vi/OoRhr0pAUh4/hq720.jpg?sqp=-oaymwEkCJUDENAFSFryq4qpAxYIARUAAAAAJQAAyEI9AICiQ3gB0AEB&rs=AOn4CLDV2KXL02fuqK8nuBkMYmXU1CxISA",
    videoId: "OoRhr0pAUh4",
  },
  {
    title: "Hardwork always Payback 💰🤑 @JONATHANGAMINGYT @sc0utOP",
    thumbnail:
      "https://i.ytimg.com/vi/V6xg-pyuogs/oar2.jpg?sqp=-oaymwEkCJUDENAFSFqQAgHyq4qpAxMIARUAAAAAJQAAyEI9AICiQ3gB&rs=AOn4CLAOpULkbRICDswMBq2wLy9mYuV67A",
    videoId: "V6xg-pyuogs",
  },
  {
    title: "Lekin* Jonny is constant 😮‍💨@JONATHANGAMINGYT",
    thumbnail:
      "https://i.ytimg.com/vi/29ydTvR5OX8/oar2.jpg?sqp=-oaymwEkCJUDENAFSFqQAgHyq4qpAxMIARUAAAAAJQAAyEI9AICiQ3gB&rs=AOn4CLDX6r5LMJcghJmqh45IRxzxYT-VwA",
    videoId: "29ydTvR5OX8",
  },
  {
    title: "Jonny Smile 💗 @JONATHANGAMINGYT",
    thumbnail:
      "https://i.ytimg.com/vi/5JQAlHX1yDU/oar2.jpg?sqp=-oaymwEkCJUDENAFSFqQAgHyq4qpAxMIARUAAAAAJQAAyEI9AICiQ3gB&rs=AOn4CLBhkkJwfmunK6Y-eUyV-f6jsy48hg",
    videoId: "5JQAlHX1yDU",
  },
  {
    title: "Samne wali team 🗿🗿 @GodLikeEsportss",
    thumbnail:
      "https://i.ytimg.com/vi/dA10Avq6msQ/hq720.jpg?sqp=-oaymwEkCJUDENAFSFryq4qpAxYIARUAAAAAJQAAyEI9AICiQ3gB0AEB&rs=AOn4CLC8zMF8YxNqGmsCHF2UdGrNZWU2xw",
    videoId: "dA10Avq6msQ",
  },
  {
    title: "yeh galat bola 😤🗿 @MazyisLive",
    thumbnail:
      "https://i.ytimg.com/vi/K1ihpU1u3Q4/oar2.jpg?sqp=-oaymwEkCJUDENAFSFqQAgHyq4qpAxMIARUAAAAAJQAAyEI9AICiQ3gB&rs=AOn4CLB9GM8u5XJc-QirJJsNODzsAhV8KQ",
    videoId: "K1ihpU1u3Q4",
  },
  {
    title: "Old memories 🤗✌️ @JONATHANGAMINGYT",
    thumbnail:
      "https://i.ytimg.com/vi/tThFx0FmZSs/oar2.jpg?sqp=-oaymwEkCJUDENAFSFqQAgHyq4qpAxMIARUAAAAAJQAAyEI9AICiQ3gB&rs=AOn4CLC7j7ZVPNxdgPDwcUJy5NUSGlOu0g",
    videoId: "tThFx0FmZSs",
  },
  {
    title: "Jonny = Messi of IGC 😮‍💨 @JONATHANGAMINGYT",
    thumbnail:
      "https://i.ytimg.com/vi/BJkFXurzvSY/hq720.jpg?sqp=-oaymwEkCJUDENAFSFryq4qpAxYIARUAAAAAJQAAyEI9AICiQ3gB0AEB&rs=AOn4CLA2almwbh308Yd394cd_6xFYGPtSg",
    videoId: "BJkFXurzvSY",
  },
  {
    title: "Some Trashtalk is needed 😮‍💨 @JONATHANGAMINGYT @goblinbgmi",
    thumbnail:
      "https://i.ytimg.com/vi/c5rc7XeXzps/oar2.jpg?sqp=-oaymwEkCJUDENAFSFqQAgHyq4qpAxMIARUAAAAAJQAAyEI9AICiQ3gB&rs=AOn4CLB-80Qm7__p8Akaum2RCVBcSFg85A",
    videoId: "c5rc7XeXzps",
  },
  {
    title: "Jonny + Goblin 😍",
    thumbnail:
      "https://i.ytimg.com/vi/K_twrfhQ7qg/hq720.jpg?sqp=-oaymwEkCJUDENAFSFryq4qpAxYIARUAAAAAJQAAyEI9AICiQ3gB0AEB&rs=AOn4CLDY8XqeSgGtlvqMSZx_la7BeBBSdw",
    videoId: "K_twrfhQ7qg",
  },
  {
    title: "Jonny - Comeback 😤",
    thumbnail:
      "https://i.ytimg.com/vi/uzmHKOFYvYs/oar2.jpg?sqp=-oaymwEkCJUDENAFSFqQAgHyq4qpAxMIARUAAAAAJQAAyEI9AICiQ3gB&rs=AOn4CLA8BrZmLpS1lQwpGsLUlWCouZ0FDg",
    videoId: "uzmHKOFYvYs",
  },
  {
    title: "BGMI - Comeback 🥺🇮🇳",
    thumbnail:
      "https://i.ytimg.com/vi/4umHKgA0kIA/hq720.jpg?sqp=-oaymwEkCJUDENAFSFryq4qpAxYIARUAAAAAJQAAyEI9AICiQ3gB0AEB&rs=AOn4CLDiszbV5PribaxRQuoNGyEogYSFng",
    videoId: "4umHKgA0kIA",
  },
  {
    title: "TOP J 🐎❤️ @JONATHANGAMINGYT",
    thumbnail:
      "https://i.ytimg.com/vi/_VB7FIUd-Ho/oar2.jpg?sqp=-oaymwEkCJUDENAFSFqQAgHyq4qpAxMIARUAAAAAJQAAyEI9AICiQ3gB&rs=AOn4CLB1KqBKyHcecGN0nBcqF8y5jMJoVA",
    videoId: "_VB7FIUd-Ho",
  },
  {
    title: "The Jonny 😎 Hacker coming soon! @JONATHANGAMINGYT",
    thumbnail:
      "https://i.ytimg.com/vi/_Xy9Ynw2HaM/oar2.jpg?sqp=-oaymwEkCJUDENAFSFqQAgHyq4qpAxMIARUAAAAAJQAAyEI9AICiQ3gB&rs=AOn4CLD-9HQ-VAy0OQuFSKdNFaz7nn_pbg",
    videoId: "_Xy9Ynw2HaM",
  },
  {
    title:
      'Badluck🥺 "Three Fav in one frame" #trending #viratkohli #cristianoronaldo #jonathangaming #viral',
    thumbnail:
      "https://i.ytimg.com/vi/U-mEzG0xV-w/oar2.jpg?sqp=-oaymwEkCJUDENAFSFqQAgHyq4qpAxMIARUAAAAAJQAAyEI9AICiQ3gB&rs=AOn4CLCzOSUOf2F-TsGGx7hbBif-mAsUng",
    videoId: "U-mEzG0xV-w",
  },
  {
    title: "Jonny Baazigar❤😎🤙🏻 @JONATHANGAMINGYT",
    thumbnail:
      "https://i.ytimg.com/vi/Yvg6IgwTmRE/oar2.jpg?sqp=-oaymwEkCJUDENAFSFqQAgHyq4qpAxMIARUAAAAAJQAAyEI9AICiQ3gB&rs=AOn4CLAxhs1Twmbma5_POCuv5x0tQYTWDw",
    videoId: "Yvg6IgwTmRE",
  },
  {
    title: "Public bolte, Tapatap pyar dete❤ @JONATHANGAMINGYT",
    thumbnail:
      "https://i.ytimg.com/vi/k4iv1CkclgY/oar2.jpg?sqp=-oaymwEkCJUDENAFSFqQAgHyq4qpAxMIARUAAAAAJQAAyEI9AICiQ3gB&rs=AOn4CLCT-2CSjjjj8H69u2trsqNp72KONQ",
    videoId: "k4iv1CkclgY",
  },
  {
    title: "Memories @JONATHANGAMINGYT 🫶",
    thumbnail:
      "https://i.ytimg.com/vi/-pMNMtH-Pj0/oar2.jpg?sqp=-oaymwEkCJUDENAFSFqQAgHyq4qpAxMIARUAAAAAJQAAyEI9AICiQ3gB&rs=AOn4CLCJjETrwiTTpjioFVJ_Y69QaIxepg",
    videoId: "-pMNMtH-Pj0",
  },
  {
    title: "Sugarcrush🤌❤ @JONATHANGAMINGYT",
    thumbnail:
      "https://i.ytimg.com/vi/72GF25fu5aY/oar2.jpg?sqp=-oaymwEkCJUDENAFSFqQAgHyq4qpAxMIARUAAAAAJQAAyEI9AICiQ3gB&rs=AOn4CLAfrPEqYRRj3hnD5pByeJBmiSxb6Q",
    videoId: "72GF25fu5aY",
  },
  {
    title: "King Kohli × King Jonny👑",
    thumbnail:
      "https://i.ytimg.com/vi/k9mPqry6oHg/hq720_2.jpg?sqp=-oaymwEkCJUDENAFSFryq4qpAxYIARUAAAAAJQAAyEI9AICiQ3gB0AEB&rs=AOn4CLCKfg9juvENCtz-Y3GonZFuru6MkQ",
    videoId: "k9mPqry6oHg",
  },
  {
    title: "Who miss this healthy trash talks🥹 @JONATHANGAMINGYT",
    thumbnail:
      "https://i.ytimg.com/vi/Q36-KjMd4V4/oar2.jpg?sqp=-oaymwEkCJUDENAFSFqQAgHyq4qpAxMIARUAAAAAJQAAyEI9AICiQ3gB&rs=AOn4CLD-Kiq30ppSUEdi_te_27zzDK6OQg",
    videoId: "Q36-KjMd4V4",
  },
  {
    title:
      "When your parents support you, then no one can defeat you❤ @JONATHANGAMINGYT",
    thumbnail:
      "https://i.ytimg.com/vi/gRWGysfc2nY/hq720_2.jpg?sqp=-oaymwEkCJUDENAFSFryq4qpAxYIARUAAAAAJQAAyEI9AICiQ3gB0AEB&rs=AOn4CLDASTUoGt8YTiLnRmBSbJZyYhsqOQ",
    videoId: "gRWGysfc2nY",
  },
  {
    title: "Unstoppable @JONATHANGAMINGYT 💪🏻",
    thumbnail:
      "https://i.ytimg.com/vi/Ld5sezO02a0/oar2.jpg?sqp=-oaymwEkCJUDENAFSFqQAgHyq4qpAxMIARUAAAAAJQAAyEI9AICiQ3gB&rs=AOn4CLB88ArNsaymGJe_GD9JvWqW0I4XOQ",
    videoId: "Ld5sezO02a0",
  },
  {
    title: "Brown Rang💪🏻 @JONATHANGAMINGYT",
    thumbnail:
      "https://i.ytimg.com/vi/t2OtZi_mq7s/oar2.jpg?sqp=-oaymwEkCJUDENAFSFqQAgHyq4qpAxMIARUAAAAAJQAAyEI9AICiQ3gB&rs=AOn4CLANnj77QamUtI3ot-wl2uHe1OooOQ",
    videoId: "t2OtZi_mq7s",
  },
  {
    title: "Jaha tak Pochkar dikhaoo🫡 @JONATHANGAMINGYT",
    thumbnail:
      "https://i.ytimg.com/vi/JSOp4o6tX1M/oar2.jpg?sqp=-oaymwEkCJUDENAFSFqQAgHyq4qpAxMIARUAAAAAJQAAyEI9AICiQ3gB&rs=AOn4CLC1kAC_gc2HWMocl92Y9MtmC5o-gQ",
    videoId: "JSOp4o6tX1M",
  },
  {
    title: "Unforgettable match🥺@JONATHANGAMINGYT",
    thumbnail:
      "https://i.ytimg.com/vi/p73YJXrU6FY/oar2.jpg?sqp=-oaymwEkCJUDENAFSFqQAgHyq4qpAxMIARUAAAAAJQAAyEI9AICiQ3gB&rs=AOn4CLBWOfkk8jEgLuErNFD7TyVQWkWodQ",
    videoId: "p73YJXrU6FY",
  },
  {
    title: "Me gya kidar tha,Idar hi to tha🗿🗿 @JONATHANGAMINGYT",
    thumbnail:
      "https://i.ytimg.com/vi/0kzX-aNBnOY/oar2.jpg?sqp=-oaymwEkCJUDENAFSFqQAgHyq4qpAxMIARUAAAAAJQAAyEI9AICiQ3gB&rs=AOn4CLAaE8NBZVI0mX2gP1gytkj8Q3ERug",
    videoId: "0kzX-aNBnOY",
  },
  {
    title: "Ayii yeah! Hacker Bolte @JONATHANGAMINGYT 😈",
    thumbnail:
      "https://i.ytimg.com/vi/Z7Ido6oNYW0/hq720_2.jpg?sqp=-oaymwEkCJUDENAFSFryq4qpAxYIARUAAAAAJQAAyEI9AICiQ3gB0AEB&rs=AOn4CLCLdDbAKMVzWuuE56a4nxUkKQzw8w",
    videoId: "Z7Ido6oNYW0",
  },
  {
    title: "Only IGC fans understand thiss🥺 @JONATHANGAMINGYT",
    thumbnail:
      "https://i.ytimg.com/vi/KBcA4LF2tQs/hq720_2.jpg?sqp=-oaymwEkCJUDENAFSFryq4qpAxYIARUAAAAAJQAAyEI9AICiQ3gB0AEB&rs=AOn4CLBVpDXm_cMN4932cHjskUoADX2uXQ",
    videoId: "KBcA4LF2tQs",
  },
  {
    title: "Hacker for a reason🛐 @JONATHANGAMINGYT",
    thumbnail:
      "https://i.ytimg.com/vi/HBNRT_eqA00/oar2.jpg?sqp=-oaymwEkCJUDENAFSFqQAgHyq4qpAxMIARUAAAAAJQAAyEI9AICiQ3gB&rs=AOn4CLC_WuA2U1Wb0EnxIjWmKkvSkEbMpg",
    videoId: "HBNRT_eqA00",
  },
  {
    title:
      "I m here for the Crown👑And you know who the king is🛐       @JONATHANGAMINGYT",
    thumbnail:
      "https://i.ytimg.com/vi/m31PFOUuBo0/oar2.jpg?sqp=-oaymwEkCJUDENAFSFqQAgHyq4qpAxMIARUAAAAAJQAAyEI9AICiQ3gB&rs=AOn4CLDBEG0_YT0rpOPd6_EqTZ9tv7vTrw",
    videoId: "m31PFOUuBo0",
  },
  {
    title: "India Have @jonathangaming @Snaxgaming @scoutop❣️",
    thumbnail:
      "https://i.ytimg.com/vi/dFN0eW02hSk/oar2.jpg?sqp=-oaymwEkCJUDENAFSFqQAgHyq4qpAxMIARUAAAAAJQAAyEI9AICiQ3gB&rs=AOn4CLAyHJgxhLxbKdFRKdWBsftMtbRhpw",
    videoId: "dFN0eW02hSk",
  },
];

const axios = require("axios");
const fs = require("fs");

app.get("/generate-random-content", async (req, res) => {
  try {
    const type = "reel";
    const user = "656b797b35e2377ad4419376";

    for (let i = 0; i < shorts.length; i++) {
      const element = shorts[i];
      const videoInfo = await ytdl.getInfo(
        `https://www.youtube.com/shorts/${element.videoId}`
      );
      const title = videoInfo.videoDetails.title;
      const description = videoInfo.videoDetails.description;
      const duration = videoInfo.videoDetails.lengthSeconds;
      const poster = `./public/content/${Date.now()}-reel.jpg`;
      const response = await axios.get(element.thumbnail, {
        responseType: "arraybuffer",
      });
      fs.writeFile(poster, response.data, () => {});

      const source = `./public/content/${Date.now()}-reel.mp4`;
      const format = ytdl.chooseFormat(videoInfo.formats, {
        quality: '18',
      });
      const stream = ytdl(element.videoId, { format });
      stream.pipe(fs.createWriteStream(source));

      await new Content({
        type,
        user,
        title,
        description,
        duration,
        source: source.replace("./public", ""),
        poster: poster.replace("./public", ""),
      }).save();
    }

    res.json("done");

    // for (let i = 0; i < 200; i++) {
    //   await new Content({
    //     date: new Date(),
    //     type,
    //     user,
    //     title: "",
    //     description: "",
    //     source: `/content/${type}-${i + 1}.mp4`,
    //     poster: `/content/${type}-${i + 1}.jpg`,
    //   }).save();
    //   console.log(i + 1);
    // }
    // ytdl("https://www.youtube.com/shorts/nsZuyPPCB34").pipe(
    //   fs.createWriteStream("video.mp4")
    // );
    // async function getVideoIds(url) {
    //   const browser = await puppeteer.launch({ headless: "new" });
    //   const page = await browser.newPage();
    //   await page.goto(url, { waitUntil: "domcontentloaded" });

    //   // res.json(await page.content());

    //   const selector = await findElementByContent(page, "/shorts/RXKYdDlOcqw");

    //   res.json(selector);

    //   // const videoIds = await page.$$eval("a#thumbnail", (anchors) => {
    //   //   console.log(anchors);
    //   //   return anchors.map((anchor) => anchor.href.split("=")[1]);
    //   // });

    //   await browser.close();
    //   console.log(videoIds, 11);
    //   return videoIds;
    // }

    // const url = "https://www.youtube.com/@_nikhileditz/shorts";
    // getVideoIds(url).then((videoIds) => {
    //   console.log(videoIds);
    // });
    // res.json("done");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
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
