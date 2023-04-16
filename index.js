const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const cors = require("cors");
const crypto = require('crypto');
const nonce = crypto.randomBytes(16).toString('base64');
const port = process.env.PORT || 5000;

app.use(cors());

mongoose.set('strictQuery', false);
dotenv.config();

// mongoose
//   .connect(process.env.MONGO_URL)
//   .then(() => console.log("DB Connection Successful"))
//   .catch((error) => console.log(error));

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);

    console.log(`DB Connection Successful: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

app.get("/", (req, res) => {
  res.send("Welcome to the Kwasanti District Rest API");
});

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self' http://localhost:5000");
  next();
});

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", `script-src 'self' 'nonce-${nonce}'`);
  next();
});

app.use(express.json());
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);

// app.listen(process.env.PORT || 5000, () => {
//   console.log("Backend server is running.");
// })

connectDB().then(() => {
  app.listen(port, () => {
    console.log("Backend server is running.");
  })
});