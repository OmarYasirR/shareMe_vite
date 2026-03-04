import React, { useState } from "react";
import { useUserContext } from "../hooks/useUserContext";
import { IoMdSearch } from "react-icons/io";
import { Link } from "react-router-dom";
import { HiMenu } from "react-icons/hi";
import logo from "../assets/logo.png";
import BufferToDataURL from "../utils/BufferToDataURL";
// import DefaultAvater from "./DefaultAvater";
import DefaultAvater from "../assets/default-avatar.png";
import Loader from "./Loader";
import UserAvatar from "./UserAvatar";

const Navbar = ({ setToggleSideBar }) => {
  const [searchTearm, setSearchTearm] = useState("");
  const { user, loading } = useUserContext();
  const isUser = localStorage.getItem("user") !== null;

  return (
    <div className="flex w-full p-2 justify-center items-center shadow-md mt-2 sm:mt-4 bg-gray-50">
      <div className="flex md:hidden justify-center items-center">
        <HiMenu
          fontSize={40}
          className="cursor-pointer"
          onClick={() => {
            setToggleSideBar(true);
          }}
        />
        <Link to="/">
          <img src={logo} alt="logo" className="w-28" />
        </Link>
      </div>

      <div className="flex flex-1 gap-3 justify-start items-center w-full rounded-md bg-gray-200 border-none outline-none focus-within:shadow-sm mr-1">
        <Link to={`/search/searchQuery?=${searchTearm}`}>
          <IoMdSearch fontSize={21} className="ml-1" />
        </Link>
        <input
          type="text"
          onChange={(e) => setSearchTearm(e.target.value)}
          placeholder="Search"
          value={searchTearm}
          className=" p-2 bg-white outline-none rounded-md flex-1"
        />
      </div>

      {loading? <Loader className="block h-fit" text="" />  :(
        <div>
          {user ? (
            <Link to={`user-profile/${user._id}`}>
              {user.img ? (
                <UserAvatar
                  user={user}
                  size="md"
                  border={true}
                />
              ) : (
                <img
                  src={DefaultAvater}
                  alt="Default Avatar"
                  className="w-10 h-10 rounded-full"
                />
              )}
            </Link>
          ) : (
            <div className="flex space-x-6">
              <Link to="/login">SIGN IN</Link>
              <Link to="/signup">SIGN UP</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;
