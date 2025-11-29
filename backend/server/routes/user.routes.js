import express from "express";
import multer from 'multer'
import storage from "../utils/cloduinary-config/cloudinaryConfig.js";
import {signUp,signIn, getUser, sendMessage, getAllConnectedusers, getMessages, markMessagesSeen, uploadProfilePic, updateProfile, sendImage} from '../controller/userController.js'
const router = express.Router();

const uplaod = multer({storage,limits:{fileSize:10*1024*1024}})

router.post("/register", signUp);
router.post("/login", signIn);
router.get("/getuser", getUser);
router.post("/sendmessage", sendMessage);
router.get("/getusers",getAllConnectedusers);
router.get("/fetchmessages",getMessages);
router.get("/seenmessage",markMessagesSeen);

router.post("/uploadprofile",uplaod.single("file"),uploadProfilePic)
router.post("/sendimage",uplaod.single("file"),sendImage)
router.put("/updateprofile",updateProfile)

export default router;
