import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Home from "./Containers/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Layout from "./Containers/Layout";
import Pins from "./Containers/Pins";
import CreatePin from "./pages/CreatePin";
import Search from "./pages/Search";

import UserProfile from "./pages/UserProfile";
import Pin from "./pages/Pin"; 
import EditPin from "./pages/EditPin";

const App = () => {
  
  useState(() => {
    document.title = "ShareMe - Discover and Share Amazing Pins";
  } , [])

  return (
    <div className="ii">
      <Layout>
        <Routes>
          <Route path="/" element={<Pins />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/pin/:pinId" element={<Pin />} />
          <Route path="/create-pin" element={<CreatePin />} />
          <Route path="/search" element={<Search />} />
          <Route path="/user-profile/:id" element={<UserProfile />} />
          <Route path='/pin/:pinId/edit' element={<EditPin />} />
          
        </Routes>
      </Layout>
    </div>
  );
};

export default App;
