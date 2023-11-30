const router = require("express").Router();
const {
  veriftTokenandAuth,
  veriftTokenandAdmin,
} = require("../Controllers/verifytoken");
const Cryptojs = require("crypto-js");
const User = require("../models/User");
const { connection } = require("../Mysql");

//updateUser
router.put("/:id", veriftTokenandAuth, async (req, res) => {
  if (req.body.password) {
    req.body.password = Cryptojs.AES.encrypt(
      req.body.password,
      process.env.SEC_PHRASE
    ).toString();
  }
  try {
    const updateUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updateUser);
  } catch (err) {
    res.status(500).json(err);
  }
});
//delete
router.delete("/:id", veriftTokenandAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("user Deleted....!!!");
  } catch (err) {
    res.status(500).json(err);
  }
});

//get User
router.get("/find/:id", veriftTokenandAdmin, async (req, res) => {
  try {
    const id=Number(req.params.id)

    const query = `SELECT * FROM custmer WHERE CustmerId=${id}`;
    connection.query(query, (err, results) => {
      if (!err && results.length > 0) {
        const { Password, ...others } = results;
        return res.status(200).json(others);
      }
      if (err) {
        console.error("MySQL query error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      res.status(403).json({ message: "user not found" });
    });
  } catch (err) {
    console.log(err)
    res.status(500).json({message:"internal Server error"});
  }
});

//get all the Users
router.get("/", veriftTokenandAdmin, async (req, res) => {
  const query = req.query.new;
  try {
    const query = `SELECT * FROM custmer`
    connection.query(query, (err, results) => {
      if (!err && results.length !== 0) {
        const { Password, ...others } = results;
        return res.status(200).json(others);
      }
      if (err) {
        console.error("MySQL query error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      res.status(403).json({ message: "users not found" });
    });
  } catch (err) {
    console.log("Server  error:",err)
    res.status(500).json({message:"internal Server error"});
  }
});

//get user stats
router.get("/stats", veriftTokenandAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
  try {
    const data = await user.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      { $project: { month: { $monyh: "$createdAt" } } },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
