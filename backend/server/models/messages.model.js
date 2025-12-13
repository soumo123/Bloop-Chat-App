import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type:String,
        required: true
    },

    receiverId: {
        type:String,
        required: true 
    },

    roomId: {
        type: String,
        required: true
    },

    message: {
        type: String,
        default: ""
    },

    messageType: {
        type: String,
        enum: ["text", "image", "file", "video"],
        default: "text"
    },

    fileUrl: {
        type: String, 
        default: null
    },

    unreadmessage:{
        type:Number,
        default:0
    },
    seen: {
        type: Boolean,
        default: false
    },

    seenAt: {
        type: Date,
        default: null
    }

}, { timestamps: true });

export default mongoose.model("Message", messageSchema);
