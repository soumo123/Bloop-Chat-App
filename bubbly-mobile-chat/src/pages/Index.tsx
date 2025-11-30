
import React, { useEffect, useState } from 'react';
import SignIn from '../components/SignIn';
import SignUp from '../components/SignUp';
import ChatApp from '../components/ChatApp';
import UserList from '../components/UserList';
import axiosInstance from '@/axiosInstance';
import { useDispatch } from 'react-redux';
import { getUserFail, getUserSuccess } from '@/redux/actions/userAction';
import Profile from '../components/Profile.tsx';
import EditProfile from '../components/EditProfile.tsx';
import { useAlert } from 'react-alert'
import LoadingScreen from '../components/LoadingScreen.tsx';


interface ProfileProps {
  url: string;
  profilePublicId: string;
}
interface User {
  userId:string,
  id: number;
  name: string;
  status: 'online' | 'offline';
  lastMessage?: string;
  username:string,
  about:string,
  profile:ProfileProps
}

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}
const Index = () => {
  const [currentView, setCurrentView] = useState<'signin' | 'signup' | 'userlist' | 'chat' | 'profile' | 'editprofile'>('signin');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const[refresh,setRefresh] = useState(false)
  const dispatch = useDispatch()
  const userId = localStorage.getItem("userId")
  const alert = useAlert()
  const handleSignIn = async (email: string, password: string) => {
    await axiosInstance.post(`/login`, { email: email, password }).then((result) => {
      if (result.status === 200) {
        alert.success("Login Successful")
        setIsAuthenticated(true);
        setCurrentView('userlist');
        dispatch(getUserSuccess(result.data.user))
        localStorage.setItem("userToken", result.data.token)
        localStorage.setItem("userId", result.data.user.userId)
      }
    }).catch((err) => {
      alert.error(err.response.data.message)
    })

  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const getUser = async () => {
    try {
      const response = await axiosInstance.get(`/getuser?userId=${userId}`)
      if (response.status === 200) {
        setIsAuthenticated(true);
        setCurrentView('userlist');
        dispatch(getUserSuccess(response.data.data))
      }
    } catch (error) {
      dispatch(getUserFail(error))
    }
  }

  useEffect(() => {
    if (userId) {
      getUser()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId,refresh])



  const handleSignUp = async (username: string, email: string, password: string) => {
    const json: RegisterPayload = {
      username, email, password
    }
    await axiosInstance.post(`/register`, json).then((res) => {
      if (res.status === 201) {
        alert.success("User Registration Successful")
        setCurrentView('signin');
      }
    }).catch((err) => {
      alert.error(err.response.data.message)
    })
  };
  const handleProfileClick = () => {
    setCurrentView('profile');
  };
  const handleEditProfileClick = () => {
    setCurrentView('editprofile');
  };

  const handleUserSelect = (user: User) => {
    console.log("selected-user", user)
    setSelectedUser(user);
    setCurrentView('chat');
  };

  const handleBackToUserList = () => {
    setSelectedUser(null);
    setCurrentView('userlist');
  };

  const handleLogout = () => {
    localStorage.removeItem("userId")
    localStorage.removeItem("userToken")
    setIsAuthenticated(false);
    setSelectedUser(null);
    setCurrentView('signin');

  };

  const handleBackToChat = () => {
    setCurrentView('chat');
  };
  const handleBackToChatEditProfile = () => {
    setCurrentView('userlist');
  };

  if (isAuthenticated && currentView === 'userlist') {
    return <UserList onUserSelect={handleUserSelect} onLogout={handleLogout} onEditProfileClick={handleEditProfileClick}
    />;
  }

  if (isAuthenticated && currentView === 'chat' && selectedUser) {
    return (
      <ChatApp
        selectedUser={selectedUser}
        onBack={handleBackToUserList}
        onLogout={handleLogout}
        onProfileClick={handleProfileClick}
      />
    );
  }
  if (isAuthenticated && currentView === 'profile' && selectedUser) {
    return (
      <Profile
        user={selectedUser}
        onBack={handleBackToChat}
      />
    );
  }
  if (isAuthenticated && currentView === 'editprofile' && selectedUser) {
    return (
      <EditProfile
        user={selectedUser}
        onBack={handleBackToChatEditProfile}
        setRefresh={setRefresh}
      />
    );
  }

   if (isLoading) {
    return <LoadingScreen />;
  }

  console.log("isLoading", isLoading)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
      {currentView === 'signin' && (
        <SignIn
          onSignIn={handleSignIn}
          onSwitchToSignUp={() => setCurrentView('signup')}
        />
      )}
      {currentView === 'signup' && (
        <SignUp
          onSignUp={handleSignUp}
          onSwitchToSignIn={() => setCurrentView('signin')}
        />
      )}
    </div>
  );
};

export default Index;
