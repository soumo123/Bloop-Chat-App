import User from '../models/user.model.js'
import Message from '../models/messages.model.js'
import { checkPassword1, generateId } from '../utils/helper.js';
import jwt from 'jsonwebtoken'
import DataEncryption from '../utils/decrypt.js';
import cloudinary from '../utils/cloduinary-config/config.js';


const crypto = new DataEncryption(process.env.SECRET_KEY)

const signUp = async (req, res) => {
    let { username, email, password } = req.body;

    try {
        if (!username || !email || !password) {
            return res.status(400).send({
                message: 'Field is missing'
            });
        }

        const emailData = await User.find({ email: email });
        if (emailData.length > 0) {
            return res.status(400).send({
                message: 'Email already present'
            });
        }
        const lastId = await generateId("USER")
        password = await crypto.encrypt(password)

        const user = await User.create({
            userId: lastId, username, email, password
        })

        return res.status(201).json({ message: 'User Craeted', success: true });
    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}


const signIn = async (req, res) => {

    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).send({ message: "Email or Password is missing", success: false });
        }
        const user = await User.findOne({ email }).select('+password')

        if (!user) {
            return res.status(400).send({ message: "Invalid email or password", success: false })
        }
        const isPasswordMatch = await checkPassword1(password, user.password);

        if (!isPasswordMatch) {
            return res.status(400).send({ message: "Invalid email Or password", success: false })
        }

        const jwtTokenObject = {
            _id: user._id,
            userId: user.userId,
            email: user.email,
            profile: user.profile,
            phone: user.phone,

        }

        const jwtToken = jwt.sign(jwtTokenObject, process.env.JWT_SECRET_KEY, {
            expiresIn: process.env.JWT_EXPIRE
        })

        return res.status(200).send({
            success: true,
            message: "User Login Successfully",
            token: jwtToken,
            user: jwtTokenObject
        })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}

const getUser = async (req, res) => {
    const { userId } = req.query
    try {
        if (!userId) {
            return res.status(400).send({ message: "User id missing", sucess: false });
        }

        const response = await User.findOne({ userId: userId })
        if (!response) {
            return res.status(400).send({ message: "No matching user found", sucess: false });
        }
        return res.status(200).send({ message: "Get user details", sucess: true, data: response });

    } catch (error) {
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}

const sendMessage = async (req, res) => {
    const { senderId, receiverId } = req.query;
    const { message, messageType, roomId } = req.body

    try {
        if (!senderId) {
            return res.status(400).send({ message: "Missing senderId", sucess: false });
        }
        if (!receiverId) {
            return res.status(400).send({ message: "Missing receiverId", sucess: false });
        }
        if (!messageType) {
            return res.status(400).send({ message: "Missing messagetype", sucess: false });
        }
        if (!roomId) {
            return res.status(400).send({ message: "Missing roomId", sucess: false });
        }

        await Message.create({
            senderId,
            receiverId,
            messageType,
            message,
            roomId
        })
        await User.updateOne(
            { userId: senderId },
            {
                $addToSet: {
                    connections: receiverId
                }
            }
        );
        await User.updateOne(
            { userId: receiverId },
            {
                $addToSet: {
                    connections: senderId
                }
            }
        );
        return res.status(201).send({ message: "Message send", success: true });

    } catch (error) {
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}


const getAllConnectedusers = async (req, res) => {
    const { userId, search } = req.query;

    try {
        if (!userId) {
            return res.status(400).send({ message: "Missing userId", success: false });
        }

        const loggedUser = await User.findOne({ userId });
        if (!loggedUser) {
            return res.status(404).send({ message: "User not found", success: false });
        }
        // ----------------------------------------------------
        // 🔍 1️⃣ SEARCH MODE — USERS WITH *NO CHAT* + MATCH KEYWORD
        // ----------------------------------------------------
        if (search) {
            // Get all messages involving logged-in user
            const previousMessages = await Message.find({
                $or: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            });

            // Build set of userIds that already had chat
            const chattedUsers = new Set();
            previousMessages.forEach(msg => {
                if (msg.senderId !== userId) chattedUsers.add(msg.senderId);
                if (msg.receiverId !== userId) chattedUsers.add(msg.receiverId);
            });

            // Search users who match keyword and NOT in chatted list
            const users = await User.find({
                userId: {
                    $nin: [...chattedUsers, userId]     // exclude chatted users + self
                },
                $or: [
                    { username: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } }
                ]
            }).select("userId username email profile");

            const finalUsers = users.map(u => ({
                id: u._id,
                userId: u.userId,
                name: u.username,
                email: u.email,
                profile: u.profile
            }));

            return res.status(200).send({
                success: true,
                users: finalUsers
            });
        }

        // ----------------------------------------------------
        // 2️⃣ DEFAULT: RETURN CONNECTED USERS + LAST MESSAGE
        // ----------------------------------------------------
        const connectedIds = loggedUser.connections || [];

        if (connectedIds.length === 0) {
            return res.status(200).send({ success: true, users: [] });
        }

        const connectedUsers = await User.find({
            userId: { $in: connectedIds }
        }).select("userId email username profile about phone created_at");

        const finalData = [];

        for (const user of connectedUsers) {
            const lastMessage = await Message.findOne({
                $or: [
                    { senderId: userId, receiverId: user.userId },
                    { senderId: user.userId, receiverId: userId }
                ]
            })
                .sort({ createdAt: -1 })
                .select("message messageType senderId createdAt seen");

            const unreadCount = await Message.countDocuments({
                senderId: user.userId,
                receiverId: userId,
                seen: false
            });
            finalData.push({
                id: user._id,
                userId: user.userId,
                name: user.username,
                email: user.email,
                profile: user.profile,
                about: user.about,
                phone: user.phone,
                created_at: user.created_at,
                unread:unreadCount,
                lastMessage: lastMessage
                    ? {
                        message: lastMessage.messageType === "image" ? "image" : lastMessage.message,
                        seen: lastMessage.seen,
                        createdAt: lastMessage.createdAt,
                        senderId: lastMessage.senderId
                    }
                    : null
            });
        }
        finalData.sort((a, b) => {
            const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
            const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
            return timeB - timeA; // Descending (latest first)
        });
        return res.status(200).send({
            success: true,
            mode: "connected_with_last_messages",
            users: finalData
        });

    } catch (error) {
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
};



const getMessages = async (req, res) => {
    const { senderId, receiverId } = req.query;

    try {
        if (!senderId || !receiverId) {
            return res.status(400).json({
                success: false,
                message: "senderId and receiverId are required",
            });
        }

        // Fetch all messages between user1 and user2
        const messages = await Message.find({
            $or: [
                { senderId: senderId, receiverId: receiverId },
                { senderId: receiverId, receiverId: senderId },
            ]
        }).sort({ createdAt: 1 }); // Oldest → Newest

        return res.status(200).json({
            success: true,
            total: messages.length,
            messages,
        });

    } catch (error) {
        console.log("Error fetching messages:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


const markMessagesSeen = async (req, res) => {
    try {
        const { senderId, receiverId } = req.query;

        if (!senderId || !receiverId) {
            return res.status(400).send({ message: "Missing IDs", success: false });
        }

        await Message.updateMany(
            {
                senderId: receiverId,
                receiverId: senderId,
                seen: false
            },
            {
                $set: { seen: true, seenAt: new Date() }
            }
        );

        return res.status(200).send({
            message: "Messages marked as seen",
            success: true
        });

    } catch (error) {
        return res.status(500).send({ message: "Internal Server Error", error });
    }
};

const uploadProfilePic = async (req, res) => {
    const { userId } = req.query;
    try {
        if (!userId) {
            return res.status(400).send({ message: "Missing userId", success: false });
        }

        if (!req.file.path || !req.file.filename) {
            return res.status(400).send({ message: "Profile pic not uploaded", success: false });
        }

        const newUrl = req.file.path;
        const newPublicId = req.file.filename;

        const user = await User.findOne({ userId });

        if (user?.profile.profilePublicId) {
            await cloudinary.uploader.destroy(user?.profile.profilePublicId);
        }

        await User.updateOne(
            { userId },
            {
                $set: {
                    profile: {
                        url: newUrl,
                        profilePublicId: newPublicId
                    }
                }
            }
        );

        return res.status(200).send({
            message: "Profile updated successfully",
            success: true,
            profile: newUrl
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
};


const updateProfile = async (req, res) => {
    const { userId } = req.query;
    const { name, email, phone, about } = req.body

    try {
        if (!userId) {
            return res.status(400).send({ message: "Missing userId", success: false });
        }
        if (!name) {
            return res.status(400).send({ message: "Username should not be empty", success: false });
        }
        if (!email) {
            return res.status(400).send({ message: "Email should not be empty", success: false });
        }

        const result = await User.updateOne({ userId: userId }, {
            $set: {
                username: name,
                email: email,
                phone: phone,
                about: about
            }
        })

        if (result.modifiedCount === 0) {
            return res.status(400).send({ success: false, message: "No changes made" });
        }
        return res.status(200).send({ success: true, message: "Profile updated" });


    } catch (error) {
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });

    }
}


const sendImage = async (req, res) => {
    const { senderId, receiverId, roomId } = req.body;

    try {
        if (!senderId) {
            return res.status(400).send({ message: "SenderId missing", success: false });
        }
        if (!receiverId) {
            return res.status(400).send({ message: "ReceiverId missing", success: false });
        }
        if (!roomId) {
            return res.status(400).send({ message: "RoomId missing", success: false });
        }
        const url = req.file.path;
        const message = await Message.create({
            senderId,
            receiverId,
            roomId,
            message: "",
            messageType: "image",
            fileUrl: url,
            seen: false,
            seenAt: null,
        });

        return res.status(200).send({ sucess: true, message: "File send", message: message })

    } catch (error) {
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });

    }
}




export {
    signUp,
    signIn,
    getUser,
    sendMessage,
    getAllConnectedusers,
    getMessages,
    markMessagesSeen,
    uploadProfilePic,
    updateProfile,
    sendImage
}