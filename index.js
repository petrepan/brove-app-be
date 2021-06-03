const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const user = require("./routes/user");
const portfolio = require("./routes/portfolio");
const loan = require("./routes/loan");
require("dotenv").config();

const app = express();

connectDB();

/*Built-in Middleware */
//parse json request body
app.use(express.json());
//parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

//enable cors
var allowedOrigins = [
  "http://localhost:3000",
  "https://brove.netlify.app",
];
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

//set routes
app.use("/api/users", user);
app.use("/api/portfolios", portfolio);
app.use("/api/loans", loan);
app.get("/api/config/paystack", (req, res) =>
 res.send(process.env.PAYSTACK_PUBLIC_KEY)
);

app.get("/", (req, res) => {
 res.status(200).send("Api is running!");
});

app.all("*", (req, res) => {
 res.status(404).json({ error: "This URL cannot be found" });
});

app.listen(process.env.PORT, () => {
 console.log(`listening on ${process.env.PORT}`);
});
