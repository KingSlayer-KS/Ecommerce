const router = require("express").Router();
const CryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");
const { connection } = require("../Mysql");
const env=require("dotenv");
env.config();

// register
router.post("/register", async (req, res) => {
  const { number, email, name, password } = req.body;
  const key = CryptoJs.enc.Utf8.parse(process.env.PASS_SEC);
  const hash = CryptoJs.AES.encrypt(password, process.env.PASS_SEC).toString();
  const date = Date.now();
  try {
    const query = `INSERT INTO custmer (CustmerId,Email, Number, Name, Password) VALUES (?, ?, ?, ?, ?)`;
    connection.query(
      query,
      [date, email, number, name, hash],
      (error, results) => {
        if (error) {
          console.error("MySQL query error:", error);
          res.status(500).json({ message: "Internal Server Error" });
        } else {
          res.status(200).json({ message: "User registered successfully" });
        }
      }
    );
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// login
router.post("/login", async (req, res) => {
  try {
    const { email,number } = req.body;
    const query = `SELECT * FROM custmer WHERE Email='${email}'`;
    connection.query(query, (error, results) => {
      if (error) {
        console.error("MySQL query error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      const key = CryptoJs.enc.Utf8.parse(process.env.PASS_SEC);
      if (results.length > 0) {
        console.log("User exists");
        const {  CustmerId,Password, isAdmin, ...others} = results[0];
        
        const hash = CryptoJs.AES.decrypt(Password, process.env.PASS_SEC);
        const passwordOG = hash.toString(CryptoJs.enc.Utf8);
        console.log(req.body.password);
        const accessToken = jwt.sign(
          {
            id: CustmerId,
            isAdmin: isAdmin,
          },
          process.env.JWT_PHRASE,
          { expiresIn: "3d" }
        );

        if (passwordOG !== req.body.password) {
          return res.status(401).json("Wrong credentials");
        }

        console.log(req.user)
        res.cookie('token', accessToken, { httpOnly: true });
        return res.status(200).json({ ...others, accessToken,id:CustmerId });
      } else {
        console.log("User does not exist");
        return res.status(401).json("User does not exist");
      }
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
