import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { UserContextProvider } from "./context/UserContext";
import { PinsContextProvider } from "./context/PinContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
const googleId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID);
root.render(
  <BrowserRouter>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <UserContextProvider>
        <PinsContextProvider>
          <App />
        </PinsContextProvider>
      </UserContextProvider>
    </GoogleOAuthProvider>
  </BrowserRouter>
);
