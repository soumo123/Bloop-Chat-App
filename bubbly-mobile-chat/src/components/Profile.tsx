import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Profile {
  url: string;
  profilePublicId: string;
}

interface UserProfileProps {
    user: {
        id: number;
        name: string;
        status: 'online' | 'offline';
        email?: string;
        phone?: string;
        created_at?: string;
        about?: string;
        profile?: Profile
    };
    onBack: () => void;
}

const Profile: React.FC<UserProfileProps> = ({ user, onBack }) => {
    // Generate user initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };
    console.log("userrr",user)
    return (
        <div className="h-screen bg-muted/20 flex flex-col">
            {/* Header */}
            <div className="bg-primary text-primary-foreground shadow-sm">
                <div className="flex items-center p-4">
                    <Button
                        onClick={onBack}
                        variant="ghost"
                        size="icon"
                        className="text-primary-foreground hover:bg-primary-foreground/10 -ml-2"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h2 className="font-medium text-lg ml-4">Contact info</h2>
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
                                    alt={user.name}
                                    className="object-cover"
                                />
                            )}

                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent text-primary text-4xl font-bold">
                                {getInitials(user?.name)}
                            </AvatarFallback>

                        </Avatar>
                        {/* <div className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-4 border-card ${user.status === 'online' ? 'bg-green-500' : 'bg-muted-foreground'
                            }`} /> */}
                    </div>
                    <h1 className="text-foreground text-2xl font-semibold mt-4">{user.name}</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {user.email || `${user.name.toLowerCase().replace(' ', '.')}@example.com`}
                    </p>
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
                            {/* Phone */}
                            <div className="profile-info-item flex items-center px-4 py-4 group">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 group-hover:bg-primary/20 transition-colors">
                                    <Phone className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-muted-foreground font-medium">Phone</p>
                                    <p className="text-sm text-foreground mt-0.5 truncate">
                                        {user.phone || '+1 (555) 123-4567'}
                                    </p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="profile-info-item flex items-center px-4 py-4 group">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 group-hover:bg-primary/20 transition-colors">
                                    <Mail className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-muted-foreground font-medium">Email</p>
                                    <p className="text-sm text-foreground mt-0.5 truncate">
                                        {user.email || `${user.name.toLowerCase().replace(' ', '.')}@example.com`}
                                    </p>
                                </div>
                            </div>

                            {/* Location */}
                            {/* <div className="profile-info-item flex items-center px-4 py-4 group">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 group-hover:bg-primary/20 transition-colors">
                                    <MapPin className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-muted-foreground font-medium">Location</p>
                                    <p className="text-sm text-foreground mt-0.5 truncate">
                                        {user.location || 'San Francisco, CA'}
                                    </p>
                                </div>
                            </div> */}

                            {/* Joined Date */}
                            <div className="profile-info-item flex items-center px-4 py-4 group">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 group-hover:bg-primary/20 transition-colors">
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
                        <div className="px-4 py-3 border-b border-border/50">
                            <h2 className="text-sm font-semibold text-foreground">About</h2>
                        </div>
                        <div className="px-4 py-4">
                            <p className="text-sm text-foreground/80 leading-relaxed">
                                {user?.about}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

