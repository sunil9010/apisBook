const express = require("express");
const path = require("path");
const uuid = require("uuid");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const cors = require("cors");
// const port = process.env.PORT || 3000;
const app = express();
app.use(cors());
const bodyParser = require("body-parser");

app.use(express.json());

const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      book
    ORDER BY
      book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

//Get Book API
app.get("/books/:bookId/", (request, response) => {});

app.post("/api/seats", async (req, res) => {
  const newSeats = req.body;
  const { seat_id, seat_number, is_selected, is_occupied, category } = newSeats;

  console.log(seat_id);

  //   Create a SQL query to insert multiple seats in a single transaction
  const sql = `INSERT INTO seats (seat_id,seat_number,is_selected,is_occupied,category)
      VALUES (
         ${seat_id},
         '${seat_number}',
         ${is_selected},
         ${is_occupied},
         '${category}'
      );`;

  // Extract an array of values for the new seats

  let data = await db.run(sql);
  res.send("Added Successfully");

  // Execute the query with multiple value sets
});

// app.get("/api/seats", async (req, res) => {
//   // Extract query parameters
//   const { category, status } = req.query;

//   // Build the SQL query dynamically based on the query parameters
//   let sql = "SELECT * FROM seats WHERE 1";

//   if (category) {
//     sql += ` AND category = ${db.escape(category)}`;
//   }

//   if (status) {
//     sql += ` AND status = ${db.escape(status)}`;
//   }

//   // Execute the SQL query with error handling
//   await db.all(sql, (err, results) => {
//     if (err) {
//       console.error("Database error:", err.message);

//       // Return a more detailed error response
//       res
//         .status(500)
//         .json({ error: "Internal server error", details: err.message });
//     } else {
//       res.json(results);
//     }
//   });
// });

app.get("/api/seats", async (req, res) => {
  // Extract query parameters
  const { category = "premium", status } = req.query;

  // Build the SQL query dynamically based on the query parameters
  let sql = `SELECT * FROM seats WHERE category like '%${category}%'`;
  let data = await db.all(sql);
  res.send(data);

  //   const params = []; // An array to store parameter values

  //   if (category) {
  //     sql += " AND category = ?";
  //     params.push(category);
  //   }

  //   if (status) {
  //     sql += " AND status = ?";
  //     params.push(status);
  //   }

  // Execute the SQL query with prepared statement and error handling
});
