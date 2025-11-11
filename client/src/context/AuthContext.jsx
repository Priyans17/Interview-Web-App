import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get API URL with fallback
  const getApiUrl = () => {
    return import.meta.env.VITE_API_URL || "http://localhost:5000";
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Verify token and get user info
      const apiUrl = getApiUrl();
      console.log("Checking auth with API URL:", apiUrl);
      
      axios
        .get(`${apiUrl}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          console.log("Auth check response:", response.data);
          setUser(response.data.user);
          setIsLoggedIn(true);
        })
        .catch((error) => {
          console.error("Auth check failed:", error);
          // Token is invalid, remove it
          localStorage.removeItem("token");
          setUser(null);
          setIsLoggedIn(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
    setIsLoggedIn(true);
    // Verify token immediately to ensure state is properly set
    try {
      const apiUrl = getApiUrl();
      const response = await axios.get(`${apiUrl}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("User verified after login:", response.data.user);
      setUser(response.data.user);
    } catch (error) {
      console.error("Error verifying token after login:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsLoggedIn(false);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser: updateUser,
        loading,
        setLoading,
        isLoggedIn,
        setIsLoggedIn,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
