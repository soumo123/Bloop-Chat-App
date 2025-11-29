import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
import User from '../models/user.model.js'
import DataEncryption from "../utils/decrypt.js";
dotenv.config();
const crypto = new DataEncryption(process.env.SECRET_KEY)

const generateToken = (id) => {
    return jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

const generateId = async (ids) => {
    let existingIds = [];
    let lastId;
    let idPrefix;
    let idLength = 8;

    if (ids === "USER") {
        idPrefix = "USER";
        lastId = await User.findOne().sort({ _id: -1 });
        existingIds.push(lastId && lastId.userId ? lastId.userId : "");
    } if (ids === "STVCAT") {
        idPrefix = "STVCAT";
        lastId = await Category.findOne().sort({ _id: -1 });
        existingIds.push(lastId && lastId.catId ? lastId.catId : "");
    }
    if (ids === "STVPD") {
        idPrefix = "STVPD";
        lastId = await Product.findOne().sort({ _id: -1 });
        existingIds.push(lastId && lastId.productId ? lastId.productId : "");
    }
    const maxNumericPart = existingIds.reduce((max, id) => {
        if (!id || !id.startsWith(idPrefix)) return max;

        const numericPart = parseInt(id.substring(idPrefix.length), 10);
        return numericPart > max ? numericPart : max;
    }, 0);

    const nextCount = maxNumericPart + 1;
    const paddedCount = String(nextCount).padStart(idLength - (idPrefix ? idPrefix.length : 0), "0");
    const nextId = idPrefix + paddedCount;


    return nextId;
};

const authMiddleware = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const result = await User.findOne({ userId: decoded.userId }).select("-otp");
            req.user = result
            next();
        } catch (err) {
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    }
    if (!token) return res.status(401).json({ message: "No token, authorization denied" });
};

let fileChunks = {}
const handleChunkUpload = async (req, res) => {
    try {
        const { fileName, index, totalChunks, fieldType } = req.body;
        const key = `${fileName}`;

        if (!fileChunks[key]) fileChunks[key] = [];
        fileChunks[key][index] = req.file.buffer;

        if (
            fileChunks[key].length == totalChunks &&
            !fileChunks[key].includes(undefined)
        ) {
            const finalBuffer = Buffer.concat(fileChunks[key]);

            const s3Res = await s3.upload({
                Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
                Key: key,
                Body: finalBuffer,
                ContentType: req.file.mimetype,
            }).promise();
            
            delete fileChunks[key];
            return res.status(201).send({ url: s3Res.Key, fieldType });
        }

        return res.status(201).send({ uploaded: true });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Upload Failed",
            error: error.stack
        });
    }
};
const handleUpdateChunkUpload = async (req, res) => {
    let fileChunks = {}
    try {
        const { index, totalChunks, fieldType } = req.body;
        const {key} = req.query
        if (!fileChunks[key]) fileChunks[key] = [];

        fileChunks[key][index] = req.file.buffer;

        if (
            fileChunks[key].length == totalChunks &&
            !fileChunks[key].includes(undefined)
        ) {
            const finalBuffer = Buffer.concat(fileChunks[key]);

            const s3Res = await s3.upload({
                Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
                Key: key,
                Body: finalBuffer,
                ContentType: req.file.mimetype,
            }).promise();

            delete fileChunks[key];
            return res.status(201).send({ url: s3Res.Key, fieldType ,message:"Image Updated"});
        }

        return res.status(201).send({ uploaded: true });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Upload Failed",
            error: error.stack
        });
    }
};
const checkPassword1 = async (password, hashedPassword) => {
  try {
    const result = await crypto.decrypt(hashedPassword);
    console.log("result",result)
    if (result === password) return true
  } catch (error) {
    console.error('Error comparing passwords:', error.stack);
    return false;
  }
};


export {
    generateToken,
    generateId,
    authMiddleware,
    handleChunkUpload,
    handleUpdateChunkUpload,
    checkPassword1
}