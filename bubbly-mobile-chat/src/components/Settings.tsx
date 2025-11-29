import React, { useState } from 'react'
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { User } from 'lucide-react';
import { useSelector } from 'react-redux';
import axiosInstanceFileUpload from '@/axiosInstanceFileUpload';
import { RootState } from "../store";
import { useAlert } from 'react-alert'


const Settings = ({ onLogout, onEditProfileClick, onUserSelect }) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const userDetails = useSelector((state:RootState) => state?.userReducer?.user)
    const [imageUrl, setImageUrl] = useState(userDetails?.profile?.url)
    const alert = useAlert()

    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const formData = new FormData();
        const file = event.target.files?.[0];
        formData.append("file", file);
        if (file) {
            console.log("Selected image:", file);
            setImageUrl(URL.createObjectURL(file));
            await axiosInstanceFileUpload.post(`/uploadprofile?userId=${userDetails?.userId}`, formData).then((res) => {
                if (res.status === 200) {
                    alert.success("Profile picture uploaded")
                }
            }).catch((err) => {
                alert.error(err.response.data.message)
            })
        }
    };
    const handleUserSelect = () => {
        onUserSelect(userDetails);
        onEditProfileClick();
    };


    return (
        <>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            {
                                !imageUrl ? (
                                    <User className="w-6 h-6" />
                                ) : (
                                    <img
                                        src={imageUrl}
                                        alt="Profile"
                                        className="img-fluid rounded-full"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                )
                            }
                        </div>
                        <div>
                            <h2 className="font-semibold">Bloop</h2>
                            <p className="text-sm text-white/80">Hey {userDetails?.username}! 😊</p>
                        </div>
                    </div>
                    {/* 3 Dots Button */}
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <IconButton
                            onClick={handleClick}
                            size="large"
                            aria-controls={open ? "menu" : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? "true" : undefined}
                        >
                            <MoreVertIcon />

                        </IconButton>
                    </Box>

                    {/* Menu */}
                    <Menu
                        anchorEl={anchorEl}
                        id="menu"
                        open={open}
                        onClose={handleClose}
                        PaperProps={{
                            elevation: 3,
                            sx: {
                                mt: 1,
                                minWidth: 180,
                                borderRadius: 2,
                                overflow: "hidden",
                            },
                        }}
                        transformOrigin={{ horizontal: "right", vertical: "top" }}
                        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                    >
                        {/* Update / Upload Photo */}
                        <MenuItem>
                            <label style={{ cursor: "pointer", width: "100%" }}>
                                Upload/Update Photo
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        handleImageUpload(e);
                                        handleClose();   // Close menu AFTER selecting file
                                    }}
                                    style={{ display: "none" }}
                                />
                            </label>
                        </MenuItem>

                        {/* Logout */}
                        <MenuItem onClick={onLogout}>
                            Logout
                        </MenuItem>
                        <MenuItem onClick={handleUserSelect}>
                            My Profile
                        </MenuItem>
                    </Menu>
                </div>
            </div>





        </>
    )
}

export default Settings
