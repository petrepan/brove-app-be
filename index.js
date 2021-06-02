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
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

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
