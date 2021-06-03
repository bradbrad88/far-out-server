const express = require("express");
const app = express();
const helmet = require("helmet");
const cors = require("cors");
require("dotenv").config();
const router = require("./router");
require("./websocket");
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
router(app);

const port = process.env.PORT || 5000;

app.listen(port);
console.log("Listening on port:", port);
