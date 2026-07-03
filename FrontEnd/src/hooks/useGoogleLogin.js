import { useState } from "react";
import { useGoogleLogin as useGoogleOAuth } from "@react-oauth/google";
import { signUpUser, signInUser, signInWithGoogle } from "../api";
import { useUserContext } from "./useUserContext";
import { useNavigate } from "react-router-dom";

export const useGoogleLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { dispatch } = useUserContext();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      setLoading(true);
      setError(null);

      // Get user info from Google
      const userInfo = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        },
      );

      if (!userInfo.ok) {
        throw new Error("Failed to fetch user info from Google");
      }

      const googleUser = await userInfo.json();

      const userData = {
        firstName: googleUser.given_name || "Google",
        lastName: googleUser.family_name || "User",
        email: googleUser.email,
        img: {
          contentType: "image/jpeg",
          format: "jpg",
          height: 400,
          public_id: `users/avatars/${googleUser.sub}`,
          url: googleUser.picture,
          width: 400
        },
      };

      console.log(userData);

      
      const response = await signInWithGoogle(userData);

      
      const data = await response.json();

      console.log("Google auth response:", data);
      

      // Store user and update context
      localStorage.setItem("User", JSON.stringify(data.usr));
      dispatch({ type: "LOGIN", payload: data.usr });
      setLoading(false);
      navigate("/");
    } catch (error) {
      setLoading(false);
      setError(error.message || `Google authentication failed. Please try again.`);
      console.error("Google auth error:", error);
    }
  };

  const handleGoogleFailure = (error) => {
    setError("Google authentication failed. Please try again.");
    console.error("Google auth failed:", error);
  };

  const googleLogin = useGoogleOAuth({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleFailure,
    flow: "implicit",
  });

  return {
    googleLogin,
    loading,
    error,
    setError,
  };
};
