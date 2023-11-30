const router = require("express").Router();
const { veriftTokenandAdmin } = require("../Controllers/verifytoken");
const Product = require("../models/Product");
const { connection } = require("../Mysql");

//create
router.post("/", veriftTokenandAdmin, async (req, res) => {
  const { Title, InStock, Price, Category, Series, Image, Color, Size } =
    req.body;
  const colorJson = JSON.stringify(Color);
  const sizeJson = JSON.stringify(Size);

  try {
    const date = Date.now();
    const query = `INSERT INTO product (ProductID, Title, InStock, Price, Category, Series, Image, Color, Size) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    connection.query(
      query,
      [
        date,
        Title,
        InStock,
        Price,
        Category,
        Series,
        Image,
        colorJson,
        sizeJson,
      ],
      (error, results) => {
        if (error) {
          console.error("MySQL query error:", error);
          return res.status(500).json({ message: "Internal Server Error" });
        }
        res.status(200).json({ message: "Product registered successfully" });
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//delete
router.delete("/:id", veriftTokenandAdmin, async (req, res) => {
  try {
    let products;
    const query = `DELETE FROM product WHERE ProductID=${req.params.id};`;
    connection.query(query, (error, results) => {
      if (error) {
        console.error("MySQL query error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      products = results;
      // console.log((JSON.parse(products[0].Size)).length)
      res.status(200).json(products);
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

//get Product
router.get("/find/:id", async (req, res) => {
  try {
    let products;
    const query = `SELECT * FROM product WHERE ProductID=${req.params.id};`;
    connection.query(query, (error, results) => {
      if (error) {
        console.error("MySQL query error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      products = results;
      res.status(200).json(products);
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

//get all the Product
router.get("/", async (req, res) => {
  try {
    let products;
    const qNew = req.query.new;
    const qCategory = req.query.category;
    let query;
    if (qNew) {
      query = `SELECT * FROM product ORDER BY ProductID DESC;`;
    } else if (qCategory) {
      query = `SELECT * FROM product WHERE Category = ${qCategory} AND ORDER BY ProductID DESC;`;
    } else {
      query = `SELECT * FROM product ORDER BY ProductID DESC;`;
    }
    connection.query(query, (error, results) => {
      if (error) {
        console.error("MySQL query error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      products = results;
      res.status(200).json(products);
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
