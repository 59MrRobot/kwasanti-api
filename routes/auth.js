const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();

//REGISTER
router.post("/register", async (req, res) => {
  const newUser = new User({
    fullName: req.body.fullName,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SECRET
    ).toString(),
    isAdmin: req.body.isAdmin,
    image: req.body.image,
    number: req.body.number,
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch(error) {
    res.status(500).json(error);
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try{
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(401).json("Wrong Credentials!");
    return;
  }

  const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_SECRET);

  const decryptedPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

  (decryptedPassword !== req.body.password) && res.status(401).json("Wrong credentials");

  const accessToken = jwt.sign(
    {
      id: user._id,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "3d" }
  );

  const { password, ...others } = user._doc;

  res.status(200).json({ ...others, accessToken });
  } catch(error) {
    res.status(500).json(error);
  }
})

module.exports = router;