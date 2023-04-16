const router = require("express").Router();
const User = require("../models/User");
const {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin
} = require("./verifyToken");
const CryptoJS = require("crypto-js");

const sendResponse = (res, data) => res.status(200).json(data);
const sendError = (res, error) => res.status(500).json(error);

//UPDATE
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SECRET
    ).toString();
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

    sendResponse(res, updatedUser);
  } catch(error) {
    sendError(res, error);
  }
})

//DELETE
// router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
//   try {
//     await User.findByIdAndDelete(req.params.id);

//     sendResponse(res, "User has been deleted...");
//   } catch(error) {
//     sendError(res, error);
//   }
// })

//GET ALL USERS
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  const query = req.query.new;

  try {
    const users = query 
      ? await User.find().sort({ _id: -1 }).limit(5)
      : await User.find();

    sendResponse(res, users);
  } catch(error) {
    sendError(res, error);
  }
})

//GET USER
router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    const { password, ...others } = user._doc;

    sendResponse(res, others);
  } catch(error) {
    sendError(res, error);
  }
})

//GET USER STATS
router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();

  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);

    sendResponse(res, data);
  } catch (error) {
    sendError(res, error);
  }
})

module.exports = router;