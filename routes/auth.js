const express = require("express");
const bcryptjs = require("bcryptjs");
const User = require("../models/user");
const authRouter = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const data = require('./data.json')

// Sign Up
authRouter.post("/api/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ msg: "User with same email already exists!" });
    }

    const hashedPassword = await bcryptjs.hash(password, 8);

    let user = new User({
      email,
      password: hashedPassword
    });
    user = await user.save();
    res.json(user);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// Sign In

authRouter.post("/api/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ msg: "User with this email does not exist!" });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect password." });
    }

    const token = jwt.sign({ id: user._id }, "passwordKey");
    res.json({ token, ...user._doc });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

authRouter.post("/tokenIsValid", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.json(false);
    const verified = jwt.verify(token, "passwordKey");
    if (!verified) return res.json(false);

    const user = await User.findById(verified.id);
    if (!user) return res.json(false);
    res.json(true);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// get user data
authRouter.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user);
  res.json({ ...user._doc, token: req.token });
});

authRouter.get('/api/search/:searchterm', (req, res) => {
  const { searchterm } = req.params;
  res.json(searchByName(searchterm))
});

authRouter.get('/api/allsongs', (req, res) => {
  res.json(data)
});



authRouter.get("/addfav/:id", auth, async (req, res) => {
  const user = await User.findById(req.user);
  const { id } = req.params;
  console.log(user)
  var fav1 = user.fav;
  if (!fav1.includes(id)) {
    fav1.push(id)
    const usernew = await User.findOneAndUpdate({ _id: user._id }, { fav: fav1 })
  }
  res.json({ success: true });
});

authRouter.get("/remfav/:id", auth, async (req, res) => {
  const user = await User.findById(req.user);
  const { id } = req.params;
  console.log(user)
  var fav1 = user.fav;
  for(let i=0;i<fav1.length;i++){
    if(fav1[i]==id){
      console.log(fav1.slice(0, i).concat(fav1.slice(i + 1)))
      const usernew = await User.findOneAndUpdate({ _id: user._id }, { fav: fav1.slice(0, i).concat(fav1.slice(i + 1)) })
    }
  }
  res.json({ success: true });
});


authRouter.get("/getfav", auth, async (req, res) => {
  const user = await User.findById(req.user);
  console.log(user)
  var fav1 = user.fav;
  var fav2 = []
  data.forEach((e)=>{
    if(fav1.includes(e.id)){
      fav2.push(e)
    }
  })
  res.json({songs:fav2,fav:fav1})
});

function searchByName(query) {
  const regex = new RegExp(query, 'i'); // Case-insensitive search
  return data.filter(item => regex.test(item.name));
}

module.exports = authRouter;
