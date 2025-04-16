import { generateToken } from "../lib/utils.js";
import User from "../models/users.models.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ message: "all fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).send("password must be atleast 6 characters");
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).send("User already exists");
    }
    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(password, salt);

    const user = new User({ email: email, name: name, password: hashpassword });
    if (user) {
      generateToken(user._id, res);
      await user.save();
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilepic,
      });
    } else {
      res.status(400).json({ message: "invalid data" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error in adding user");
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("please signup first");
    }
    const ispasswordcorrect = await bcrypt.compare(password, user.password);
    if (!ispasswordcorrect)
      return res.status(400).json({ message: "invalid password" });
    if (user && ispasswordcorrect) {
      generateToken(user._id, res);
      return res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilepic,
      });
    } else {
      return res.status(401).send("invalid credentials");
    }
  } catch (error) {
    console.log(error);
    return res.status(404).send("login error");
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "user logout successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilepic } = req.body;
    const userId = req.user._id;
    if (!profilepic) {
      return res.status(400).json({ message: "profile pic is required" });
    }
    const uploadresponse = await cloudinary.uploader.upload(profilepic);
    const updateduser = await User.findByIdAndUpdate(
      userId,
      { profilepic: uploadresponse.secure_url },
      { new: true }
    );

    res.status(200).json(updateduser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
