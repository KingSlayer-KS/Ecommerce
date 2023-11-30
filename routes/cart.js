const router = require("express").Router();
const {
  veriftTokenandAdmin,
  veriftToken,
  veriftTokenandAuth,
} = require("../Controllers/verifytoken");
const {
  validateProduct,
  ValidateCart,
} = require("../Controllers/ValidateProducts");
const { connection } = require("../Mysql");

// GET /cart - Get user's cart items
router.get("/:id", veriftToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(userId);
    // Fetch cart items for the user from the database
    const query1 = `SELECT
      cart.CartId,
      cart.color,
      cart.ProductId,
      cart.quantity,
      cart.size,
      product.Title,
      product.Price,
      product.Image,
      cart.quantity * product.Price AS TotalPrice
    FROM cart
    JOIN product ON cart.ProductId = product.ProductID
    WHERE cart.UserId = ${userId}`;
    
    const query2 = `SELECT SUM(cart.quantity * product.Price) AS GrandTotal
    FROM cart
    JOIN product ON cart.ProductId = product.ProductID
    WHERE cart.UserId = ${userId}`;
    
    connection.query(query1, (error, cartResults) => {
      if (error) {
        console.log(error);
        return res.status(403);
      }

      connection.query(query2, (error, totalResults) => {
        if (error) {
          console.log(error);
          return res.status(403);
        }
        
        const grandTotal = totalResults[0].GrandTotal;

        if (cartResults.length > 0) {
          return res.status(200).json({ cart: cartResults, grandTotal });
        }
        return res.status(403).json({ message: "no record Found" });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch cart items." });
  }
});


// POST /cart - Add item to cart {Create new Cart}
router.post(
  "/",
  veriftToken,
  validateProduct,
  ValidateCart,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { productId, quantity,color,size } = req.body;
      const date = Date.now();

      // Insert the item into the cart table
      const query =
        "INSERT INTO cart (CartId,userId, productId, quantity,size,color) VALUES (?,?, ?, ?,?,?)";
      connection.query(query, [
        date,
        userId,
        productId,
        quantity,
        size,
        color
      ],(result,err)=>{
        if (err) console.log(err)
        res.status(200).json({ message: "Item added to cart successfully." });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to add item to cart." });
    }
  }
);

// DELETE /cart/:itemId - Remove item from cart
router.delete("/:itemId", veriftTokenandAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.itemId;

    // Delete the item from the cart table
    const query = "DELETE FROM cart WHERE userId = ? AND ProductId = ?";
    connection.query(query, [userId, productId],(err,result)=>{
      if(err)console.log(err)
      res.status(200).json({ message: "Item removed from cart successfully." });
    });
   
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to remove item from cart." });
  }
});

// PUT /cart/:itemId - Update item quantity in cart
router.put("/:itemId", veriftTokenandAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.itemId;
    const { quantity } = req.body;

    // Update the item quantity in the cart table
    const query =
      "UPDATE cart SET quantity = ? WHERE userId = ? AND ProductID = ?;";
    const results = await connection.query(query, [quantity, userId, itemId]);
    res
      .status(200)
      .json({ message: "Item quantity updated in cart successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update item quantity in cart." });
  }
});

//get all the cart
router.get("/", veriftTokenandAdmin, async (req, res) => {
  try {
    const query = "SELECT * FROM cart ORDER BY CartId DESC";
    await connection.query(query, (err, results) => {
      if(err){
        console.log(err)
        return res.status(403).res.json({message:err})
      }
      if (results.length > 0) {
        return res.status(200).json(results);
      } else {
        return res.status(200).json({ message: "No data found." });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch cart items." });
  }
});

module.exports = router;
