import Message from "../models/message.model.js";
import User from "../models/users.models.js"
import cloudinary from "../lib/cloudinary.js";

export const getUsersForSidebar = async (req,res) =>{
    try {
        const loogedinuserid = req.users._id
        const filteredusers = await User.find({_id: {$ne:loggedinuserid}}).select('-password');
        res.status(200).json(filteredusers)
    } catch (error) {
        console.log("Error in getusersfor sidebar", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getMessages = async (req,res) =>{
    try {
        const chatid = req.params.id
        const myId = req.user._id;
        const messages = await Message.find({
            $or:[
                {senderId : myId, receiverId : chatid},
                {senderId: chatid , receiverId : myId}
            ]
        })

        res.status(200).json(messages)
    } catch (error) {
        console.log("Error", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const sendMessage = async (req,rez) =>{
    try {
        const {text,image} = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;
        let imageurl;
        if(image){
            const uploadresponse = await cloudinary.uploader.upload(image);
            imageurl = uploadresponse.secure_url;
        }
        const newmessage = new Message({
            senderId,receiverId,text,image:imageurl
        })

        await newmessage.save();
        res.status(201).json(newmessage);
    } catch (error) {
        console.log("Error", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}