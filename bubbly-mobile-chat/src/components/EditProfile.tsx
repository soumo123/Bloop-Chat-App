import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, Calendar, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axiosInstance from '@/axiosInstance';
import { useAlert } from 'react-alert'


interface EditProfileProps {
    user: {
        id: number;
        username:string,
        status: 'online' | 'offline';
        email?: string;
        phone?: string;
        created_at?: string;
        profile?: { url?: string };
        about?: string;
    };
    onBack: () => void;
    setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}
interface FormDataType {
  name: string;
  email: string;
  phone: string;
  about: string;
}

const EditProfile: React.FC<EditProfileProps> = ({ user, onBack, setRefresh }) => {
  const alert = useAlert()
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Editable states
    const [editField, setEditField] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormDataType>({
        name: user.username,
        email: user.email || "",
        phone: user.phone || "",
        about: user.about,
    });
    const userId = localStorage.getItem("userId")
    const isEditing = editField !== null;

    const handleSave = async () => {
        console.log("Updated profile data:", formData);
        const json:FormDataType = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            about: formData.about
        }
        await axiosInstance.put(`/updateprofile?userId=${userId}`, json).then((res) => {
            if (res.status === 200) {
                alert.success("Profile Updated")
                setRefresh(prev => !prev);
                setEditField(null);
            }
        }).catch((err)=>{
            alert.error(err.response.data.message)
        })
    };

    return (
        <div className="h-screen bg-muted/20 flex flex-col">
            {/* Header */}
            <div className="bg-primary text-primary-foreground shadow-sm">
                <div className="flex items-center justify-between p-4">

                    {/* Back button */}
                    <div className="flex items-center">
                        <Button
                            onClick={onBack}
                            variant="ghost"
                            size="icon"
                            className="text-primary-foreground hover:bg-primary-foreground/10 -ml-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h2 className="font-medium text-lg ml-4">My Profile</h2>
                    </div>

                    {/* Save button (only in edit mode) */}
                    {isEditing && (
                        <Button
                            onClick={handleSave}
                            className="bg-white text-primary hover:bg-white/90"
                        >
                            Save
                        </Button>
                    )}

                </div>
            </div>

            {/* Profile Content */}
            <div className="flex-1 overflow-y-auto">

                {/* Profile Header */}
                <div className="bg-card pt-8 pb-6 flex flex-col items-center animate-slide-up">
                    <div className="relative">
                        <Avatar className="w-32 h-32 border-4 border-background shadow-lg">

                            {user?.profile?.url && (
                                <AvatarImage
                                    src={user.profile.url}
                                    alt={user.username}
                                    className="object-cover"
                                />
                            )}

                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent text-primary text-4xl font-bold">
                                {getInitials(user?.username)}
                            </AvatarFallback>

                        </Avatar>

                        {/* <div
                            className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-4 border-card ${user.status === 'online'
                                ? 'bg-green-500'
                                : 'bg-muted-foreground'
                                }`}
                        /> */}
                    </div>

                    {/* Name (editable) */}
                    {editField === "name" ? (
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-56 text-center mt-4"
                        />
                    ) : (
                        <h1
                            className="text-foreground text-2xl font-semibold mt-4 cursor-pointer"
                            onClick={() => setEditField("name")}
                        >
                            {formData.name}
                        </h1>
                    )}

                    {/* Email (editable) */}
                    {editField === "email" ? (
                        <Input
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-56 text-center mt-1"
                        />
                    ) : (
                        <p
                            className="text-muted-foreground text-sm mt-1 cursor-pointer"
                            onClick={() => setEditField("email")}
                        >
                            {formData.email || "no-email@example.com"}
                        </p>
                    )}
                </div>

                {/* Profile Details */}
                <div className="mt-6 space-y-6 pb-6">

                    {/* Personal Info Section */}
                    <div className="bg-card shadow-sm">
                        <div className="px-4 py-3 border-b border-border/50">
                            <h2 className="text-sm font-semibold text-foreground flex items-center">
                                <User className="w-4 h-4 mr-2 text-primary" />
                                Personal Information
                            </h2>
                        </div>

                        <div className="divide-y divide-border/50">

                            {/* Phone with Country Code */}
                            <div className="profile-info-item flex items-center px-4 py-4 group">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 group-hover:bg-primary/20">
                                    <Phone className="w-5 h-5 text-primary" />
                                </div>

                                <div className="flex-1 min-w-0">

                                    <p className="text-xs text-muted-foreground font-medium">Phone</p>

                                    {editField === "phone" ? (
                                        <div className="flex gap-2 items-center mt-1">
                                            <Input
                                                className="flex-1"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    ) : (
                                        <p
                                            className="text-sm text-foreground mt-0.5 truncate cursor-pointer"
                                            onClick={() => setEditField("phone")}
                                        >
                                            {formData.phone || "Enter phone"}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Email */}
                            <div className="profile-info-item flex items-center px-4 py-4 group">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 group-hover:bg-primary/20">
                                    <Mail className="w-5 h-5 text-primary" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-muted-foreground font-medium">Email</p>

                                    {editField === "email" ? (
                                        <Input
                                            className="mt-1"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    ) : (
                                        <p
                                            className="text-sm text-foreground mt-0.5 truncate cursor-pointer"
                                            onClick={() => setEditField("email")}
                                        >
                                            {formData.email}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Joined Date */}
                            <div className="profile-info-item flex items-center px-4 py-4 group">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 group-hover:bg-primary/20">
                                    <Calendar className="w-5 h-5 text-primary" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-muted-foreground font-medium">Member Since</p>
                                    <p className="text-sm text-foreground mt-0.5">
                                        {user.created_at
                                            ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                                            : "NA"}
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* About Section */}
                    <div className="bg-card shadow-sm">
                        <div className="px-4 py-3 border-b border-border/50 flex justify-between items-center">
                            <h2 className="text-sm font-semibold text-foreground">About</h2>

                            {!isEditing && (
                                <Button
                                    variant="ghost"
                                    onClick={() => setEditField("about")}
                                    className="text-xs text-primary hover:text-primary/80"
                                >
                                    Edit
                                </Button>
                            )}
                        </div>

                        <div className="px-4 py-4">
                            {editField === "about" ? (
                                <Textarea
                                    value={formData.about}
                                    onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                                    className="w-full"
                                />
                            ) : (
                                <p
                                    className="text-sm text-foreground/80 leading-relaxed cursor-pointer"
                                    onClick={() => setEditField("about")}
                                >
                                    {formData.about}
                                </p>
                            )}
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default EditProfile;
