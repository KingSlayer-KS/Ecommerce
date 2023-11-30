const router = require("express").Router();
const {
  veriftTokenandAdmin,
  veriftTokenandAuth,
} = require("../Controllers/verifytoken");
const { connection } = require("../Mysql");
const env = require("dotenv");
env.config();

//CREATE

router.post("/", veriftTokenandAuth, async (req, res) => {
  const userId = req.user.id;

  // Retrieve cart items for the user
  connection.query(
    "SELECT * FROM cart WHERE userId = ?",
    userId,
    (err, cartItems) => {
      if (err) {
        console.error("Error retrieving cart items: ", err);
        return res.status(500).json({ error: "Failed to retrieve cart items." });
      }

      if (cartItems.length === 0) {
        return res.status(400).json({ error: "No items in the cart." });
      }

      const query2 = `
        SELECT SUM(cart.quantity * product.Price) AS GrandTotal
        FROM cart
        JOIN product ON cart.ProductId = product.ProductID
        WHERE cart.UserId = ?`;

      connection.query(query2, userId, (error, totalResults) => {
        if (error) {
          console.log(error);
          return res.status(403).json({ error: "Error calculating total." });
        }

        const grandTotal = totalResults[0].GrandTotal;

        if (cartItems.length > 0) {
          // Create the order in the orders table
          const {  address, state, city, pincode } = req.body.info;
          const { razorpay_payment_id } = req.body;
          console.log(req.body)
          const OrdeId = Date.now();
          const sql = `
            INSERT INTO ecommerce.order (OrdeId, Address, TotalPrice, CustmerId, State, City, PostalCode, Status, razorpay_payment_id)
            VALUES (?, ?, ?, ?, ?, ?, ?,'pending',?)`;

          connection.query(
            sql,
            [OrdeId, address, grandTotal, userId, state, city, pincode, razorpay_payment_id],
            (err, result) => {
              if (err) {
                console.error("Error creating order: ", err);
                return res.status(500).json({ error: "Failed to create order." });
              }
              // Insert cart items as order items
              const orderItems = cartItems.map((cartItem) => ({
                  OrderId:OrdeId,
                ProductID: cartItem.ProductId,
                ProductQuantity: cartItem.quantity,
              }));

              connection.query("INSERT INTO order_items SET ?", orderItems, (err) => {
                if (err) {
                  console.error("Error creating order items: ", err);
                  return res.status(500).json({ error: "Failed to create order items." });
                }

                // Clear the cart by deleting all cart items for the user
                connection.query(
                  "DELETE FROM cart WHERE userId = ?",
                  userId,
                  (err) => {
                    if (err) {
                      console.error("Error clearing cart: ", err);
                      return res.status(500).json({ error: "Failed to clear cart." });
                    }

                    res.json({ message: "Checkout successful. Order created." });
                  }
                );
              });
            }
          );
        } else {
          return res.status(403).json({ message: "No record found in cart." });
        }
      });
    }
  );
});


//DELETE
// router.delete("/:orederId", veriftTokenandAdmin, async (req, res) => {
//   try {
//     const orederId = req.params.orederId;

//     // Delete the item from the cart table
//     const query = "DELETE FROM order WHERE OrdeId = ?";
//     const query2 = "DELETE FROM order_items WHERE OrdeId = ?";
//     await connection.query(query, [userId, orederId]);
//     await connection.query(query2, [userId, orederId]);
//     res.status(200).json({ message: "Order Deleted successfully." });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to delete order" });
//   }
// });

//GET USER ORDERS
router.get("/find/:userId", veriftTokenandAuth, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Delete the item from the cart table
    const query = "Select * FROM order WHERE userId = ? ";
    const results = await connection.query(query, [userId]);
    res.status(200).json({ message: "Item removed from cart successfully." });
  } catch (error) {
    console.error(error);
  }
});

// //GET ALL

router.get("/", veriftTokenandAdmin, async (req, res) => {
  try {
    const query = "SELECT * FROM order";
    await connection.query(query, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(403).res.json({ message: err });
      }
      if (results.length > 0) {
        return res.status(200).json(results);
      } else {
        return res.status(200).json({ message: "No data found." });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch orders." });
  }
});

//get monthly income
router.get("/income", veriftTokenandAdmin, async (req, res) => {
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const query = `
      SELECT MONTH(CreatedAt) AS month, SUM(TotalPrice) AS total
      FROM orders
      WHERE CreatedAt >= ?
      GROUP BY MONTH(CreatedAt)
    `;
    const results = await connection.query(query, [previousMonth]);

    return res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
// Get top ten most sold products for a specific duration
router.get("/top-products", veriftTokenandAdmin,async (req, res) => {
  const { duration } = req.query;

  try {
    let startDate;
    switch (duration) {
      case "day":
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "alltime":
        startDate = new Date(0);
        break;
      default:
        return res.status(400).json({ error: "Invalid duration." });
    }

    const query = `
      SELECT ProductID, SUM(ProductQuantity) AS totalSold
      FROM order_items
      INNER JOIN orders ON order_items.idorder_items = orders.OrdeId
      WHERE orders.createdAt >= ?
      GROUP BY ProductID
      ORDER BY totalSold DESC
      LIMIT 10
    `;

    const results = await connection.query(query, [startDate]);
    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
