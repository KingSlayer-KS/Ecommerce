const { connection } = require("../Mysql");

const validateProduct = (req, res, next) => {
  const { productId } = req.body;
  const query = `SELECT InStock FROM product WHERE ProductID=${productId}`;
  connection.query(query, (err, results) => {
    if (
      !err &&
      results.length !== 0 &&
      req.body.quantity <= 3 &&
      results[0].InStock >= req.body.quantity
    ) {
      next();
    }
    if (err) {
      console.error("MySQL query error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    if (!err && results.length === 0) {
      return res.status(404).json({ message: "Product Doesnot exist " });
    }
    if (req.body.quantity > 3) {
      return res.status(404).json({ message: "Bad Request" });
    }
    if (results[0].InStock <= req.body.quantity) {
      return res.status(404).json({ message: "Not enough Stock" });
    }
  });
};
const ValidateCart = (req, res, next) => {
  const id = req.user.id;
  const query = `SELECT quantity FROM cart  WHERE UserId=${id}`;
  connection.query(query, (err, results) => {
    console.log(results);
    // if (!err && results.length !== 0 && req.body.quantity<=3 &&results[0].InStock>=req.body.quantity) {
    //   next();
    // }
    if (err) {
      console.error("MySQL query error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    if (!err && results.length === 0 ) {
      next();
    }
    if (results.length >= 3) {
      return res.status(404).json({ message: "You Cannot add more products" });
    }
    if (results.length <= 3) {
      next();
    }
  });
};

module.exports = { validateProduct, ValidateCart };
