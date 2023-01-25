import express from "express";
import path from "path";
import cors from "cors";
import mongoose, { Mongoose } from "mongoose";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

import { stringToHash, varifyHash } from "bcrypt-inzi";
import multer from "multer";
import bucket from "./firebaseAdmin/index.mjs";
import fs from 'fs'

const SECRET = process.env.SECRET || "topsecret";
const app = express();
const port = process.env.PORT || 5001;
const MongoDBURI =
  process.env.MongoDBURI ||
  "mongodb+srv://abdul:abdulpassword@cluster0.zcczzqa.mongodb.net/test?retryWrites=true&w=majority";

const storageConfig = multer.diskStorage({
  destination: "./uploads/",
  filename: function (req, file, cb) {
    console.log("mul-file: ", file);
    cb(null, `${new Date().getTime()}-${file.originalname}`);
  },
});
var uploadMiddleware = multer({ storage: storageConfig });

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      //   "http://localhost:3000/signup",
      //   "http://localhost:3000/login",
      //   "https://spring-bud-pike-coat.cyclic.app",
      //   "https://spring-bud-pike-coat.cyclic.app/signup",
      //   "https://spring-bud-pike-coat.cyclic.app/login",
      "*",
    ],
    credentials: true,
    origin: true,
  })
);

app.use(express.json());
app.use(cookieParser());

const userSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true },
  password: { type: String, required: true },

  createdOn: { type: Date, default: Date.now },
});
const userModel = mongoose.model("Users", userSchema);

let productSchema = new mongoose.Schema({
  description: String,
  owner: { type: mongoose.ObjectId, required: true },
  createdOn: { type: Date, default: Date.now },
  pictureURL: {type: String}
});
const productModel = mongoose.model("products", productSchema);


let products = [];

app.post("/api/v1/signup", (req, res) => {
  let body = req.body;

  if (!body.firstName || !body.lastName || !body.email || !body.password) {
    res.status(400).send(
      `required fields missing, request example: 
                {
                    "firstName": "John",
                    "lastName": "Doe",
                    "email": "abc@abc.com",
                    "password": "12345"
                }`
    );
    return;
  }

  req.body.email = req.body.email.toLowerCase();

  // check if user already exist // query email user
  userModel.findOne({ email: body.email }, (err, user) => {
    if (!err) {
      console.log("user: ", user);

      if (user) {
        // user already exist
        console.log("user already exist: ", user);
        res.status(400).send({
          message: "user already exist,, please try a different email",
        });
        return;
      } else {
        // user not already exist

        // bcrypt hash
        stringToHash(body.password).then((hashString) => {
          userModel.create(
            {
              firstName: body.firstName,
              lastName: body.lastName,
              email: body.email,
              password: hashString,
            },
            (err, result) => {
              if (!err) {
                console.log("data saved: ", result);
                res.status(201).send({ message: "user is created" });
              } else {
                console.log("db error: ", err);
                res.status(500).send({ message: "internal server error" });
              }
            }
          );
        });
      }
    } else {
      console.log("db error: ", err);
      res.status(500).send({ message: "db error in query" });
      return;
    }
  });
});

app.post("/api/v1/login", (req, res) => {
  let body = req.body;
  body.email = body.email.toLowerCase();

  if (!body.email || !body.password) {
    // null check - undefined, "", 0 , false, null , NaN
    res.status(400).send(
      `required fields missing, request example: 
                {
                    "email": "abc@abc.com",
                    "password": "12345"
                }`
    );
    return;
  }

  // check if user exist
  userModel.findOne(
    { email: body.email },
    "email password firstName lastName",
    (err, data) => {
      if (!err) {
        console.log("data: ", data);

        if (data) {
          // user found
          varifyHash(body.password, data.password).then((isMatched) => {
            console.log("isMatched: ", isMatched);

            if (isMatched) {
              const token = jwt.sign(
                {
                  _id: data._id,
                  email: data.email,
                  iat: Math.floor(Date.now() / 1000) - 30,
                  exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
                },
                SECRET
              );

              console.log("token: ", token);

              res.cookie("Token", token, {
                maxAge: 86_400_000,
                httpOnly: true,
                sameSite: "none",
                secure: true,
              });

              res.send({
                message: "login successful",
                profile: {
                  email: data.email,
                  firstName: data.firstName,
                  lastName: data.lastName,
                  age: data.age,
                  _id: data._id,
                },
              });
              return;
            } else {
              console.log("password did not match");
              res.status(401).send({ message: "Incorrect email or password" });
              return;
            }
          });
        } else {
          // user not already exist
          console.log("user not found");
          res.status(401).send({ message: "Incorrect email or password" });
          return;
        }
      } else {
        console.log("db error: ", err);
        res.status(500).send({ message: "login failed, please try later" });
        return;
      }
    }
  );
});

app.post("/api/v1/logout", (req, res) => {
  res.cookie("Token", "", {
    maxAge: 1,
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  res.send({ message: "Logout successful" });
});

app.use("/api/v1", (req, res, next) => {
  console.log("req.cookies: ", req.cookies);

  if (!req?.cookies?.Token) {
    res.status(401).send({
      message: "include http-only credentials with every request",
    });
    return;
  }

  jwt.verify(req.cookies.Token, SECRET, function (err, decodedData) {
    if (!err) {
      console.log("decodedData: ", decodedData);

      const nowDate = new Date().getTime() / 1000;

      if (decodedData.exp < nowDate) {
        res.status(401);
        res.cookie("Token", "", {
          maxAge: 1,
          httpOnly: true,
          sameSite: "none",
          secure: true,
        });
        res.send({ message: "token expired" });
      } else {
        console.log("token approved");

        req.token = decodedData;
        next();
      }
    } else {
      res.status(401).send("invalid token");
    }
  });
});

const gettingUser = async (req, res) => {
  let _id = "";
  if (req.params.id) {
    _id = req.params.id;
  } else {
    _id = req.token._id;
  }

  try {
    const user = await userModel
      .findOne({ _id: _id }, "firstName lastName -_id")
      .exec();
    if (!user) {
      res.status(404);
      res.send({});
      return;
    } else {
      res.status(200);
      res.send({ user });
    }
  } catch (error) {
    console.log("Error", error);
    res.status(500);
    res.send({
      message: "Error",
    });
  }
};

app.post("/api/v1/changePassword", async (req, res) => {
  try {
    const body = req.body;
    const oldPassword = body.oldPassword;
    const newPassword = body.newPassword;
    const _id = req.token._id;

    // check if user exist
    const user = await userModel.findOne({ _id: _id }, "password").exec();

    if (!user) throw new Error("User not found");

    const isMatched = await varifyHash(oldPassword, user.password);
    if (!isMatched) throw new Error("Password Did'nt Match");

    const newHash = await stringToHash(newPassword);

    await userModel.updateOne({ _id: _id }, { password: newHash }).exec();

    // success
    res.send({
      message: "Password Change!",
    });
    return;
  } catch (error) {
    console.log("error: ", error);
    res.status(500).send();
  }
});

app.get("/api/v1/profile", gettingUser);

app.get("/api/v1/profile:id", gettingUser);

app.post("/api/v1/product", uploadMiddleware.any(), (req, res) => {
  const body = req.body;

  if (!body.description) {
    res.status(404);
    res.send({
      message: "All Inputs Are Required",
    });
    return;
  }
  // products.push(
  //     {
  //         id: new Date().getTime(),
  //         name: body.name,
  //         price: body.price,
  //         description: body.description

  //     }
  // )
  const token = jwt.decode(req.cookies.Token);
  console.log("Token", token);

  console.log("req.body: ", req.body);
  //   console.log("req.body: ", JSON.parse(req.body.myDetails));
  console.log("req.files: ", req.files);

  console.log("uploaded file name: ", req.files[0].originalname);
  console.log("file type: ", req.files[0].mimetype);
  console.log("file name in server folders: ", req.files[0].filename);
  console.log("file path in server folders: ", req.files[0].path);

  bucket.upload(
    req.files[0].path,
    {
      destination: `PostPictures/${req.files[0].filename}`,
    },
    function (err, file, apiResponse) {
      if (!err) {
        file
          .getSignedUrl({
            action: "read",
            expires: "03-09-2491",
          })
          .then((urlData, err) => {
            if (!err) {
              console.log("public downloadable url: ", urlData[0]);
              // res.send("Ok");
              productModel.create(
                {
                  description: body.description,
                  pictureURL: urlData[0],
                  owner: new mongoose.Types.ObjectId(token._id),
                },
                (err, saved) => {
                  if (!err) {
                    console.log(saved);

                    res.send({
                      message: "your product is saved",
                    });
                  } else {
                    console.log("Not Gone");
                    res.status(500).send({
                      message: "server error",
                    });
                  }
                }
              );
            }
          });
      } else {
        console.log("err: ", err);
        res.status(500).send();
      }
    }
  );

  // res.send({
  //     message: "Product Added Successfully!",
  //     data: products
  // });
});

app.get("/api/v1/products", async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.token._id);
  try {
    const data = await productModel
      .find({ owner: userId })
      // .select({description: 0, name: 0}) // projection
      .sort({ _id: -1 })
      .exec();

    res.send({
      message: "Got All Products",
      data: data,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send({
      message: "server error",
    });
  }
});

app.get("/api/v1/product/:id", (req, res) => {
  const id = req.params.id;
  productModel.findOne({ _id: id }, (err, data) => {
    if (!err) {
      if (data) {
        res.send({
          message: `Product Found ${data._id}`,
          data: data,
        });
      } else {
        res.status(404).send({
          message: "Product Not Found",
        });
      }
    } else {
      res.status(500).send({
        message: "Server Error",
      });
    }
  });
});

app.delete("/api/v1/product/:id", (req, res) => {
  const id = req.params.id;

  productModel.deleteOne({ _id: id }, (err, deletedData) => {
    console.log("deleted: ", deletedData);
    if (!err) {
      if (deletedData.deletedCount !== 0) {
        res.send({
          message: "Product Deleted Successfully!",
        });
      } else {
        res.status(404);
        res.send({
          message: "Could't Find This Product",
        });
      }
    } else {
      res.status(500).send({
        message: "server error",
      });
    }
  });
});

app.put("/api/v1/product/:editId", async (req, res) => {
  const body = req.body;
  const id = req.params.editId;

  if (!body.description) {
    res.status(400).send({
      message: "required parameters missing",
    });
    return;
  }

  try {
    let data = await productModel
      .findByIdAndUpdate(
        id,
        {
          description: body.description,
        },
        { new: true }
      )
      .exec();

    console.log("updated: ", data);

    res.send({
      message: "product modified successfully",
    });
  } catch (error) {
    res.status(500).send({
      message: "server error",
    });
  }
});

const __dirname = path.resolve();

app.use("/", express.static(path.join(__dirname, "./web/build")));
app.use("*", express.static(path.join(__dirname, "./web/build")));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

mongoose.connect(MongoDBURI);

mongoose.connection.on("connected", function () {
  console.log("Mongoose is connected");
});

mongoose.connection.on("disconnected", function () {
  console.log("Mongoose is disconnected");
  process.exit(1);
});

mongoose.connection.on("error", function (err) {
  console.log("Mongoose connection error: ", err);
  process.exit(1);
});

process.on("SIGINT", function () {
  console.log("app is terminating");
  mongoose.connection.close(function () {
    console.log("Mongoose default connection closed");
    process.exit(0);
  });
});
