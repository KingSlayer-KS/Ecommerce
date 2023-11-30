const router = require("express").Router();
const Razorpay = require("razorpay");
const {
  veriftTokenandAdmin,
  veriftTokenandAuth,
} = require("../Controllers/verifytoken");
const crypto =require( "crypto");

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_APT_SECRET,
});

router.post("/payment", async (req, res) => {
  const options = {
    amount: Number(req.body.amount * 100),
    currency: "INR",
  };
  const order = await instance.orders.create(options);

  res.status(200).json({
    success: true,
    order,
  });
});

router.post("/paymentVerification", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  console.log(req.body)
  console.log(req.headers)
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_APT_SECRET)
    .update(body.toString())
    .digest("hex");
  console.log(razorpay_signature)
  const isAuthentic = expectedSignature === razorpay_signature;
  console.log(isAuthentic)
  if (isAuthentic) {
    res.status(200).json({
      success: true,
    })
    
  } else {
    res.status(400).json({
      success: false,
    });
  }
});

module.exports = router;
