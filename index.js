const express = require("express");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const cors = require("cors");
const port = process.env.PORT || 3000;
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
    app.listen(port, () => {
      console.log(`Server Running at http://localhost:${port}/`);
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

app.get("/api/seats", async (req, res) => {
  // Extract query parameters
  const { category = "", status } = req.query;

  // Build the SQL query dynamically based on the query parameters
  let sql = `SELECT * FROM seats WHERE category like '%${category}%'`;
  let data = await db.all(sql);
  res.send(data);
});

app.post("/api/seats", async (req, res) => {
  const newSeats = req.body;

  // Create a SQL query with placeholders
  const sql = `
    INSERT INTO seats (seat_id, seat_number, is_selected, is_occupied, category)
    VALUES (?, ?, ?, ?, ?);
  `;

  try {
    await db.run("BEGIN"); // Start a transaction

    for (const seat of newSeats) {
      const { seat_number, is_selected, is_occupied, category } = seat;
      const seat_id = uuidv4();
      await db.run(
        sql,
        seat_id,
        seat_number,
        is_selected,
        is_occupied,
        category
      );
    }

    await db.run("COMMIT"); // Commit the transaction

    res.send("Added Successfully");
  } catch (err) {
    console.error("Database error:", err.message);
    await db.run("ROLLBACK"); // Rollback the transaction in case of an error
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});
