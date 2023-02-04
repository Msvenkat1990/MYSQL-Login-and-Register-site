const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE,
});
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).render("login", {
        msg: "Please enter your email and password",
        msg_type: "error",
      });
    }
    db.query(
      "select * from users where email=?",
      [email],
      async (error, result) => {
        if (result.length <= 0) {
          return res.status(401).render("login", {
            msg: "Email or password Incorrect...",
            msg_type: "error",
          });
        } else {
          if (!(await bcrypt.compare(password, result[0].PASS))) {
            return res.status(402).render("login", {
              msg: "Email or password Incorrect...",
              msg_type: "error",
            });
          } else {
            const id = result[0].ID;
            const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
              expiresIn: process.env.JWT_EXPIRES_IN,
            });
            console.log("The token is " + token);
            const cookieOptions = {
              expires: new Date(
                Date.now() +
                  process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
              ),
              httpOnly: true,
            };
            res.cookie("data", token, cookieOptions);
            res.status(200).redirect("/home");
          }
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};
exports.register = (req, res) => {
  const { name, email, password, confirm_password } = req.body;
  db.query(
    "select email from users where email=?",
    [email],
    async (error, result) => {
      if (error) {
        console.log(error);
      }

      if (result.length > 0) {
        return res.render("register", {
          msg: "Email id already taken",
          msg_type: "error",
        });
      } else if (password !== confirm_password) {
        return res.render("register", {
          msg: "Password do no match",
          msg_type: "error",
        });
      }
      let hashPassword = await bcrypt.hash(password, 8);
      db.query(
        "insert into users set ?",
        { name: name, email: email, pass: hashPassword },
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            console.log(result);
            return res.render("register", {
              msg: "User registration success",
              msg_type: "good",
            });
          }
        }
      );
    }
  );
};
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.data) {
    const decode = await promisify(jwt.verify)(
      req.cookies.data,
      process.env.JWT_SECRET
    );
   
    try {
      db.query(
        "select * from users where id=?",
        [decode.id],

        (err, results) => {
          if(!results){
            return next();
          }
          req.user = results[0];
          return next();
        }
      );
    } catch (error) {
      console.log(error);
      return next();
    }
  } else {
    next();
  }
};
exports.logout = async (req,res)=>{
  res.cookie("data","logout",{
    expires:new Date(Date.now() + 2 * 1000),
    httpOnly:true,
  });
  res.status(200).redirect("/");
}