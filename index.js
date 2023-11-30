const express=require("express")
const app=express();
const env=require("dotenv");
const cors = require("cors");
const mysql = require('mysql');

app.use(express.json())
env.config()
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ecommerce'
  });
  db.connect((err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Mysql connected"); 
      };     
    }
  );

const userRoute=require("./routes/user")
const authRoute=require("./routes/auth")
const productRoute=require("./routes/product")
const orderRoute=require("./routes/order")
const cartRoute=require("./routes/cart")
const stripeRoute=require("./routes/stripe")

app.use("/api/user",userRoute);
app.use("/api/auth",authRoute);
app.use("/api/product",productRoute);
app.use("/api/order",orderRoute);
app.use("/api/cart",cartRoute);
app.use("/api/checkout", stripeRoute);

app.listen(process.env.PORT||5000, ()=>
console.log("running at 5000"))