const server = require("express");
const mysql = require("mysql");
const dotenv = require("dotenv");
const path = require("path");
const hbs = require("hbs");
const cookieParser = require("cookie-parser");
const app = server();
dotenv.config({
  path: "./.env",
});
const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE,
});

db.connect((err) => {
  if (err) {
    throw err;
  } else {
    console.log("MYSQL Connection successfully");
  }
});
app.use(cookieParser());
app.use(server.urlencoded({ extended: false }));
const location = path.join(__dirname, "./public");
app.use(server.static(location));
app.set("view engine", "hbs");

const partialsPath = path.join(__dirname, "./views/partials");
hbs.registerPartials(partialsPath);
app.use("/", require("./router/router"));
app.use("/auth", require("./router/auth"));

app.listen(4000, () => {
  console.log("server run at port 4000");
});
