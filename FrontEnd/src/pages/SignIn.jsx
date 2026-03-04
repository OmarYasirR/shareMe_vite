import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import shareVideo from "../assets/share.mp4";
import logo from "../assets/logowhite.png";
import { useSignIn } from "../hooks/useSignIn";
import { useGoogleLogin } from "@react-oauth/google";
import { fetchGoogleUser, signInUser } from "../api";
import { useUserContext } from "../hooks/useUserContext";
import Alert from "../components/Alert";
import { convertToBase64 } from "../utils/imageUtils";
import Spinner from "../components/Spinner";

const Login = () => {
  const { user, dispatch } = useUserContext();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [loggingGoogle, setLoggingGoogle] = useState(false);
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // google login handler
  const googleLoginHandler = async () => {
    setLoggingGoogle(true);
    googleLogin();
  }

  const googleLogin = useGoogleLogin({
    // flow: 'auth-code',
    onSuccess: async (codeResponse) => {

      try {
      const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${codeResponse.access_token}`,
        },
      });
      if (!userInfoResponse.ok) {
        setLoggingGoogle(false);
        setError("Failed to fetch user info from Google");
        return;
      }
      const userInfo = await userInfoResponse.json();
      const user = {
        google: true,
        name: userInfo.name,
        email: userInfo.email
      }
      console.log("Google user info fetched:", user);
      const signInRes = await signInUser(user);
      if (!signInRes.ok) {
        const errorData = await signInRes.json();
        setLoggingGoogle(false);
        setError(errorData.error || "Google login failed");
        return;
      }
      const data = await signInRes.json();
      console.log('Google user signed in successfully:', data.user);
      dispatch({ type: "LOGIN", payload: data.user });
      setLoggingGoogle(false);
      navigate("/", { replace: true });
    } catch (error) {
      setLoggingGoogle(false);
      setError("An error occurred during Google login. Please try again.");
      console.error("Google login error:", error);
      return;
    }
      // try {
      //   const res = await fetchGoogleUser(codeResponse.code);
      //   if(res.ok) {
      //     const user = await res.json();
      //     const newUser = {...user, google: true};
      //     const signInRes = await signInUser(newUser);
      //     if (!signInRes.ok) {
      //       const errorData = await signInRes.json();
      //       throw new Error(errorData.error || "Google login failed");
      //     }
      //     console.log('google user data has been fetched seccessfuly')
      //     dispatch({ type: "LOGIN", payload: signInRes.user });
      //     navigate("/");
      //   } else {
      //     const errorData = await res.json();
      //     throw new Error(errorData.error || "Google login failed");
      //   }
      // } catch (error) {
      //   setError(error.message || "Google login failed. Please try again.");
      //   console.error("Google login error:", error);  
      // } finally {
      //   setLoggingGoogle(false);
      // }
        console.log('Google login successful, code response:', codeResponse);
        
      // googleResponse.profileObj = {
      //   // name: googleResponse.profileObj.name,
      //   // email: googleResponse.profileObj.email,
      //   // imageUrl: googleResponse.profileObj.picture,
      // };
      // console.log("Google login successful:", googleResponse);
      // submitHandler(googleResponse.profileObj);
    },
    onError: (error) => {
      setLoggingGoogle(false);
      setError("Google login failed");
    }
  });

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userData = { email, password };
      const res = await signInUser(userData);
      if (res.status !== 200) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Login failed");
      }
      const data = await res.json();
      console.log(data.user);

      // console.log('Login response:', JSON.parse(res));
      // localStorage.setItem("User", JSON.stringify(data));
      dispatch({ type: "LOGIN", payload: data.user });
      setLoading(false);
      navigate("/");
    } catch (error) {
      setLoading(false);
      setError(error.message || "Login failed. Please try again.");
    }
  };

  const googleResponse = (response) => {
    const { name, imageUrl, email } = response.profileObj;
    const user = { google: true, name, img: imageUrl, email };
    submitHandler(user);
  };

  return (
    <div className="flex justify-start items-center flex-col">
      <div className="flex justify-center flex-col items-center">
        <div className="p-2 bg-red-400 rounded-lg my-2">
          <img
            src={logo}
            alt="logo"
            className="h-auto"
            style={{ width: "160px" }}
          />
        </div>

        <div className="shadow-xl bg-white rounded-2xl p-8 w-full max-w-md mx-4">
          {/* Google Sign In Button */}
          <div className="mb-6">
            <button
              className="w-full bg-white border border-gray-300 hover:bg-gray-50 flex justify-center items-center rounded-lg p-3 cursor-pointer outline-none transition-all duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              onClick={googleLoginHandler}
              type="button"
              disabled={loggingGoogle || loading}
            >
              {loggingGoogle?
                (<Spinner size="sm" />) :<FcGoogle className="text-xl" />
}
              <span className="text-gray-700 font-medium ml-3">
                {loggingGoogle ? "Signing in..." : "Sign in with Google"}
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={submitHandler} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || loggingGoogle}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Spinner size="sm" className="mr-2" />
                  Signing In...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}
    </div>
  );
};

export default Login;
