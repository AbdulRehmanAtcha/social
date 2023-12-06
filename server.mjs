import express from "express";
import path from "path";
import cors from "cors";
import mongoose, { Mongoose } from "mongoose";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

import { stringToHash, varifyHash } from "bcrypt-inzi";
import multer from "multer";
import bucket from "./firebaseAdmin/index.mjs";
const SECRET = process.env.SECRET || "topsecret";
const app = express();
const port = process.env.PORT || 5001;
const MongoDBURI =
  process.env.MongoDBURI ||
  "mongodb+srv://abdul:abdulpassword@cluster0.zcczzqa.mongodb.net/test?retryWrites=true&w=majority";

  const storageConfig = multer.diskStorage({
    destination: "./temp_uploads/",  // Use a temporary directory
    filename: function (req, file, cb) {
      cb(null, `${new Date().getTime()}-${file.originalname}`);
    },
  });
var uploadMiddleware = multer({ storage: storageConfig });

app.use(
  cors({
    origin: [
      "http://localhost:3000",
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
      ("user: ", user);

      if (user) {
        // user already exist
        ("user already exist: ", user);
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
                ("data saved: ", result);
                res.status(201).send({ message: "user is created" });
              } else {
                ("db error: ", err);
                res.status(500).send({ message: "internal server error" });
              }
            }
          );
        });
      }
    } else {
      ("db error: ", err);
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
        ("data: ", data);

        if (data) {
          // user found
          varifyHash(body.password, data.password).then((isMatched) => {
            ("isMatched: ", isMatched);

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

              ("token: ", token);

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
              ("password did not match");
              res.status(401).send({ message: "Incorrect email or password" });
              return;
            }
          });
        } else {
          // user not already exist
          ("user not found");
          res.status(401).send({ message: "Incorrect email or password" });
          return;
        }
      } else {
        ("db error: ", err);
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
  ("req.cookies: ", req.cookies);

  if (!req?.cookies?.Token) {
    res.status(401).send({
      message: "include http-only credentials with every request",
    });
    return;
  }

  jwt.verify(req.cookies.Token, SECRET, function (err, decodedData) {
    if (!err) {
      ("decodedData: ", decodedData);

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
        ("token approved");

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
    ("Error", error);
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
    ("error: ", error);
    res.status(500).send();
  }
});

app.get("/api/v1/profile", gettingUser);

app.get("/api/v1/profile:id", gettingUser);

app.post("/api/v1/product", uploadMiddleware.any(), (req, res) => {
  const body = req.body;

  if (!body.description) {
    res.status(400).send({
      message: "Description is required",
    });
    return;
  }

  const token = jwt.decode(req.cookies.Token);

  if (!req.files || req.files.length === 0) {
    productModel.create(
      {
        description: body.description,
        owner: new mongoose.Types.ObjectId(token._id),
      },
      (err, saved) => {
        if (!err) {
          res.send({
            message: "Text-only data processed successfully",
          });
        } else {
          res.status(500).send({
            message: "Server error",
          });
        }
      }
    );
    return;
  }
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
              productModel.create(
                {
                  description: body.description,
                  pictureURL: urlData[0],
                  owner: new mongoose.Types.ObjectId(token._id),
                },
                (err, saved) => {
                  if (!err) {
                    res.send({
                      message: "File and text data processed successfully",
                    });
                  } else {
                    res.status(500).send({
                      message: "Server error",
                    });
                  }
                }
              );
            }
          });
      } else {
        res.status(500).send({
          message: "File upload error",
        });
      }
    }
  );
});

app.get("/api/v1/products", async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.token._id);
  try {
    const data = await productModel
      .find({ owner: userId })
      .sort({ _id: -1 })
      .exec();

    res.send({
      message: "Got All Products",
      data: data,
    });
  } catch (e) {
    (e);
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
    ("deleted: ", deletedData);
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

    ("updated: ", data);

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
  (`Example app listening on port ${port}`);
});

mongoose.connect(MongoDBURI);

mongoose.connection.on("connected", function () {
  ("Mongoose is connected");
});

process.on("SIGINT", function () {
  ("app is terminating");
  mongoose.connection.close(function () {
    ("Mongoose default connection closed");
    process.exit(0);
  });
});



