
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User, LogOut } from 'lucide-react';
import axiosInstance from '@/axiosInstance';
import socket from '@/socket';
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import Settings from './Settings';

interface User {
  id: number;
  name: string;
  status: 'online' | 'offline';
  lastMessage?: string;
  avatar?: string;
}

interface UserListProps {
  onUserSelect: (user: User) => void;
  onLogout: () => void;
  onEditProfileClick: () => void
}

const UserList: React.FC<UserListProps> = ({ onUserSelect, onLogout, onEditProfileClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchNewusers, setSearchNewUsers] = useState([])
  const [users, setUsers] = useState([])
  const [onUsers, setOnusers] = useState([])
  const [lastTypingTime, setLastTypingTime] = useState(null);
  const [loadSkel, setLoadSkel] = useState(false)
  const userId = localStorage.getItem("userId")
  const receiveSound = new Audio("/happy-pop-3-185288.mp3");

  useEffect(() => {
   
  }, [])
  


  useEffect(() => {
    socket.on("lastMessageUpdate", (data) => {
      setUsers((prev) => {
        const exists = prev.some(
          (user) =>
            user.userId === data.senderId || user.userId === data.receiverId
        );

        if (exists) {
          // UPDATE existing user
          return prev.map((user) =>
            user.userId === data.senderId || user.userId === data.receiverId
              ? { ...user, lastMessage: { message: data.message } }
              : user
          );
        } else {
          // ADD new user (your required ELSE condition)
          return [
            ...prev,
            {
              name: data.name,
              userId: data.senderId,
              lastMessage: { message: data.message },
            },
          ];
        }
      });
      receiveSound.play();
    });
    return () => socket.off("lastMessageUpdate");
  }, []);

  useEffect(() => {
    const getConnectedUsers = async () => {
      try {
        setLoadSkel(true)
        const result = await axiosInstance.get(`/getusers?userId=${userId}`);
        if (result.status === 200) {

          setUsers(result.data.users.map(u => ({
            ...u,
            status: "offline" // default
          })));
          setLoadSkel(false)
        }
      } catch (error) {
        console.log(error);
        setLoadSkel(true)
      }
    };

    getConnectedUsers();
  }, [userId]);

  // // Mock user data
  // const users: User[] = [
  //   {
  //     id: 1,
  //     name: 'Alice Johnson',
  //     status: 'online',
  //     lastMessage: 'Hey! How are you doing?',
  //   },
  //   {
  //     id: 2,
  //     name: 'Bob Smith',
  //     status: 'online',
  //     lastMessage: 'Thanks for your help yesterday',
  //   },
  //   {
  //     id: 3,
  //     name: 'Carol Davis',
  //     status: 'offline',
  //     lastMessage: 'See you tomorrow!',
  //   },
  //   {
  //     id: 4,
  //     name: 'David Wilson',
  //     status: 'online',
  //     lastMessage: 'The project looks great 👍',
  //   },
  //   {
  //     id: 5,
  //     name: 'Emma Brown',
  //     status: 'offline',
  //     lastMessage: 'Let me know when you\'re free',
  //   },
  // ];

  const handleOnSearch = (value) => {
    setLastTypingTime(new Date().getTime())
    setSearchTerm(value)
  }

  const fetchUsers = async () => {
    try {
      setLoadSkel(true)
      const result = await axiosInstance.get(
        `/getusers?userId=${userId}&search=${searchTerm}`
      );
      setUsers(result.data.users.map(u => ({
        ...u,
        status: "offline" // default
      })));
      setLoadSkel(false)
    } catch (error) {
      console.log("An error occurred while fetching data.");
      setUsers([]);
      setLoadSkel(false)
    }
  };
  useEffect(() => {
    if (!lastTypingTime) return;
    const timer = setTimeout(fetchUsers, 1000);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!userId) return;
    socket.emit("online", userId);
  }, [userId]);

  useEffect(() => {
    socket.on("updateStatus", ({ userId, status, onUsers }) => {
      setOnusers(onUsers)
      setUsers(prev =>
        prev.map(u =>
          u.userId === userId ? { ...u, status } : u
        )
      );
    });

    return () => {
      socket.off("updateStatus");
    };
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Settings onLogout={onLogout} onEditProfileClick={onEditProfileClick} onUserSelect={onUserSelect} />

      {/* Search */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => handleOnSearch(e.target.value)}
            className="pl-10 rounded-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {
          loadSkel ? (
            <div className="p-4 text-center text-gray-500">
              <div className="p-3">
                {[1, 2, 3, 4, 5].map((item) => (
                  <Box
                    key={item}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      paddingY: 1.5,
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {/* Avatar Skeleton */}
                    <Skeleton
                      variant="circular"
                      width={48}
                      height={48}
                      animation="wave"
                    />

                    {/* Middle Section (Name + Message) */}
                    <Box sx={{ marginLeft: 2, flexGrow: 1 }}>
                      <Skeleton
                        variant="text"
                        width="50%"
                        height={14}
                        animation="wave"
                      />
                      <Skeleton
                        variant="text"
                        width="80%"
                        height={12}
                        animation="wave"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>

                    {/* Time Skeleton (Right side) */}
                    <Box sx={{ marginLeft: 1 }}>
                      <Skeleton
                        variant="text"
                        width={30}
                        height={12}
                        animation="wave"
                      />
                    </Box>
                  </Box>
                ))}
              </div>
            </div>
          ) : (
            <>
              {
                filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No users found</p>
                  </div>
                ) : (

                  filteredUsers.map((user) => (
                    <div
                      key={user.userId}
                      onClick={() => onUserSelect(user)}
                      className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors animate-fade-in"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                            {user?.profile?.url ? (
                              <img
                                src={user.profile.url}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-6 h-6 text-gray-600" />
                            )}
                          </div>
                          <div
                            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${onUsers?.includes(user.userId) ? "bg-green-500" : "bg-gray-400"
                              }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900 truncate">
                              {user.name}
                            </h3>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${onUsers?.includes(user.userId)
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                              {
                                onUsers?.includes(user.userId) ? "Online" : "Offline"
                              }

                            </span>
                          </div>
                          {user.lastMessage && (
                            <p className="text-sm text-gray-500 truncate mt-1">
                              {user.lastMessage.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )
              }

            </>
          )
        }
      </div>
    </div>
  );
};

export default UserList;
