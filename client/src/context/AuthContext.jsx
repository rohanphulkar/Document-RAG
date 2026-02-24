import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../utils/api";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const response = await authAPI.getCurrentUser();
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem("token");
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { access_token } = response.data;
      localStorage.setItem("token", access_token);
      setToken(access_token);

      const userResponse = await authAPI.getCurrentUser();
      setUser(userResponse.data);
      toast.success("Login successful!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.detail || "Login failed");
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      await authAPI.register({ name, email, password });
      toast.success("Registration successful! Please login.");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.detail || "Registration failed");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    toast.success("Logged out successfully");
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
