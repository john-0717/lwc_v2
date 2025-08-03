import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface UserData {
  userId:string;
  id: string;
  email: string;
  name: string;
  firstName?:string;
  lastName?:string;
  picture?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  occupation?: string;
  church?: string;
  interests: string[];
  prayerRequests?: string;
  testimony?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  preferences: {
    emailNotifications: boolean;
    prayerUpdates: boolean;
    eventReminders: boolean;
    newsletter: boolean;
  };
  role?: "admin" | "writer" | "member";
  joinDate?: string;
}

interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  login: (userData: UserData) => void;
  logout: () => void;
  updateUser: (userData: Partial<UserData>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error loading saved user:", error);
        localStorage.removeItem("lwc_user");
      }
    }else{
        setIsAuthenticated(false);
    }
  }, []);

  const login = (userData: UserData) => {
    const userWithDefaults = {
      ...userData,
      role: userData.role || "user",
    };
    
    setUser(userWithDefaults);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(userWithDefaults));
    
    // Here you would typically also send the data to your Node.js backend
    // sendUserDataToBackend(userWithDefaults);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.clear()
    
    // Clear any other auth-related data
    // You might also want to call your backend to invalidate the session
  };

  const updateUser = (updatedData: Partial<UserData>) => {
    if (user) {
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      localStorage.setItem("lwc_user", JSON.stringify(updatedUser));
      
      // Send updated data to backend
      // updateUserDataInBackend(updatedUser);
    }
  };


  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};