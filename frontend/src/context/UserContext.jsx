import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile on startup or when token changes
  const fetchProfile = useCallback(async (authToken) => {
    try {
      setLoading(true);
      setError(null);
      // Set the temporary token in Axios headers manually to ensure it's present
      const response = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUser(response.data);
    } catch (err) {
      console.error("Failed to load user profile:", err);
      // Clean up invalid tokens
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
      setUser(null);
    }
  }, [token, fetchProfile]);

  // Helper to parse FastAPI/Pydantic validation errors
  const parseError = (err, defaultMsg) => {
    if (err.response?.data?.detail) {
      const detail = err.response.data.detail;
      if (Array.isArray(detail)) {
        // It's a Pydantic validation error array
        return detail.map(d => `${d.loc[d.loc.length - 1]}: ${d.msg}`).join(", ");
      }
      return detail; // It's a normal string error
    }
    return defaultMsg;
  };

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { access_token, user: userData } = response.data;
      localStorage.setItem("token", access_token);
      setToken(access_token);
      setUser(userData);
      return { success: true };
    } catch (err) {
      const detail = parseError(err, "Login failed. Please check your credentials.");
      const isUnverified = err.response?.status === 403;
      const unverifiedEmail = err.response?.headers?.["x-account-email"] || null;
      setError(detail);
      return {
        success: false,
        error: detail,
        isUnverified,
        email: unverifiedEmail
      };
    }
  }, []);

  const register = useCallback(async (username, email, password) => {
    setError(null);
    try {
      const response = await api.post("/auth/register", { username, email, password });
      return { success: true, email: response.data.email };
    } catch (err) {
      const detail = parseError(err, "Registration failed.");
      setError(detail);
      return { success: false, error: detail };
    }
  }, []);

  const verifyOtp = useCallback(async (email, otp) => {
    setError(null);
    try {
      await api.post("/auth/verify-otp", { email, otp });
      return { success: true };
    } catch (err) {
      const detail = parseError(err, "Invalid OTP code.");
      setError(detail);
      return { success: false, error: detail };
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    setError(null);
    try {
      await api.post("/auth/forgot-password", { email });
      return { success: true };
    } catch (err) {
      const detail = parseError(err, "Failed to process forgot password request.");
      setError(detail);
      return { success: false, error: detail };
    }
  }, []);

  const resetPassword = useCallback(async (email, password, otp) => {
    setError(null);
    try {
      await api.post("/auth/reset-password", { email, password, otp });
      return { success: true };
    } catch (err) {
      const detail = parseError(err, "Failed to reset password.");
      setError(detail);
      return { success: false, error: detail };
    }
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    setError(null);
    try {
      await api.post("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      return { success: true };
    } catch (err) {
      const detail = parseError(err, "Failed to change password.");
      setError(detail);
      return { success: false, error: detail };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        verifyOtp,
        forgotPassword,
        resetPassword,
        changePassword,
        logout,
        setError,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
}
