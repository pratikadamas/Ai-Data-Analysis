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

  useEffect(() => {
    const handleExpired = () => {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      setProfilePicState(null);
    };
    window.addEventListener("auth_token_expired", handleExpired);
    return () => window.removeEventListener("auth_token_expired", handleExpired);
  }, []);

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
      return { success: true, email: response.data.email, dev_otp: response.data.dev_otp };
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
      const response = await api.post("/auth/forgot-password", { email });
      return { success: true, dev_otp: response.data?.dev_otp };
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

  const loginWithGoogle = useCallback(async (idToken) => {
    setError(null);
    try {
      const response = await api.post("/auth/google", { id_token: idToken });
      const { access_token, user: userData } = response.data;
      localStorage.setItem("token", access_token);
      setToken(access_token);
      setUser(userData);
      return { success: true };
    } catch (err) {
      const detail = parseError(err, "Google sign-in failed. Please try again.");
      setError(detail);
      return { success: false, error: detail };
    }
  }, []);

  const resendOtp = useCallback(async (email, purpose = "registration") => {
    setError(null);
    try {
      const response = await api.post("/auth/resend-otp", { email, purpose });
      // next_allowed_at is an ISO string from the server
      return { success: true, nextAllowedAt: response.data.next_allowed_at, dev_otp: response.data.dev_otp };
    } catch (err) {
      const detail = parseError(err, "Failed to resend OTP.");
      // Server may return X-Next-Allowed-At header on 429
      const nextAllowedAt = err.response?.headers?.["x-next-allowed-at"] || null;
      setError(detail);
      return { success: false, error: detail, nextAllowedAt };
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

  const getPicKey = (u) => (u?.email ? `profile_pic_${u.email}` : "profile_pic");

  const [profilePic, setProfilePicState] = useState(() => {
    try {
      return localStorage.getItem("profile_pic") || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      const key = getPicKey(user);
      const stored = localStorage.getItem(key) || localStorage.getItem("profile_pic");
      setProfilePicState(stored || null);
    } else {
      setProfilePicState(null);
    }
  }, [user]);

  const updateProfilePic = useCallback((base64Url) => {
    try {
      const key = user ? getPicKey(user) : "profile_pic";
      if (base64Url) {
        localStorage.setItem(key, base64Url);
        setProfilePicState(base64Url);
      } else {
        localStorage.removeItem(key);
        setProfilePicState(null);
      }
    } catch (e) {
      console.error("Failed to save profile pic to localStorage:", e);
    }
  }, [user]);

  const removeProfilePic = useCallback(() => {
    updateProfilePic(null);
  }, [updateProfilePic]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setProfilePicState(null);
    setError(null);
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        profilePic,
        updateProfilePic,
        removeProfilePic,
        login,
        register,
        verifyOtp,
        forgotPassword,
        resetPassword,
        resendOtp,
        changePassword,
        loginWithGoogle,
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
