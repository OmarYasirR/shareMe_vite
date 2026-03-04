import { useState } from "react";
import { useGoogleLogin as useGoogleOAuth } from "@react-oauth/google";
import { signUpUser, signInUser } from "../api";
import { useUserContext } from "./useUserContext";
import { useNavigate } from "react-router-dom";

export const useGoogleLogin = (type = 'signup') => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { dispatch } = useUserContext();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      setLoading(true);
      setError(null);

      // Get user info from Google
      const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
      });
      
      if (!userInfo.ok) {
        throw new Error('Failed to fetch user info from Google');
      }

      const googleUser = await userInfo.json();

      // Prepare user data according to your model
      const userData = {
        firstName: googleUser.given_name || "Google",
        lastName: googleUser.family_name || "User",
        email: googleUser.email,
        password: Math.random().toString(36).slice(-16) + Math.random().toString(36).slice(-16),
        img: googleUser.picture || "",
        google: true
      };

      let response;
      if (type === 'signup') {
        response = await signUpUser(userData);
      } else {
        response = await signInUser({ email: googleUser.email, google: true });
      }

      // Store user and update context
      localStorage.setItem("User", JSON.stringify(response));
      dispatch({ type: "LOGIN", payload: response });
      setLoading(false);
      navigate("/");

    } catch (error) {
      setLoading(false);
      setError(error.message || `Google ${type} failed. Please try again.`);
      console.error('Google auth error:', error);
    }
  };

  const handleGoogleFailure = (error) => {
    setError("Google authentication failed. Please try again.");
    console.error('Google auth failed:', error);
  };

  const googleLogin = useGoogleOAuth({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleFailure,
    flow: 'implicit'
  });

  return {
    googleLogin,
    loading,
    error,
    setError
  };
};