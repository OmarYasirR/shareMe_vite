import React, { useEffect, useRef, useState } from "react";
import logo from "../assets/logo.png";
import { useUserContext } from "../hooks/useUserContext";
import { usePinsContext } from "../hooks/usePinsContext";
import { Link, NavLink } from "react-router-dom";
import { RiHomeFill } from "react-icons/ri";
import { AiFillCloseCircle } from "react-icons/ai";
import { useGetPins } from "../hooks/useGetPins";
import { getPins } from "../api";
import BufferToDataURL from "../utils/BufferToDataURL";
import DefaultAvater from "./DefaultAvater";
import UserAvatar from "./UserAvatar";

const isNotActiveStyle =
  "flex items-center gap-2 text-gray-500 hover:text-black transition-all duration-200 ease-in-out capitalize p-1";

const isActiveStyle =
  "flex items-center gap-2 border-r-2 border-black transition-all duration-200 ease-in-out capitalize bg-amber-100 p-1";

const SideBar = ({ toggleSideBar, setToggleSideBar }) => {
  const [active, setActive] = useState(0);
  const { dispatch } = usePinsContext();
  const { user } = useUserContext();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  let pins;

  // const bufferToDataURL = (buffer, contentType) => {
  //   if (!buffer || !buffer.data) return null;

  //   // Convert buffer array to base64 string
  //   const base64 = btoa(
  //     buffer.data.reduce((data, byte) => data + String.fromCharCode(byte), "")
  //   );

  //   return `data:${contentType};base64,${base64}`;
  // };

  const getData = async () => {
    try {
      setError(null);
      setLoading(true);
      pins = await getPins();
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  // const { pins } = useGetPins();

  const scrollRef = useRef();

  const categories = [
    { name: "Animal" },
    { name: "Wallpapers" },
    { name: "phtography" },
    { name: "Gaming" },
    { name: "Conding" },
  ];

  const classHandler = (ac, cat) => {
    if (active == ac) {
      return isActiveStyle;
    } else {
      return isNotActiveStyle;
    }
  };

  const SidebarContent = () => {
    return (
      <div className="flex flex-col justify-between bg-white h-full hide-scrollbar z-50">
        <div className="flex flex-col">
          <Link className="flex gap-2 my-6 pt-1 w-190 items-center" to="/">
            <img src={logo} alt="logo" className="w-full" />
          </Link>
          <div className="flex flex-col gap-4">
            <div
              className={`${classHandler(0, "all")}  cursor-pointer p-2 pl-0`}
              onClick={() => {
                setActive(0);
                setToggleSideBar(false);
                // dispatch({ type: "CREATE_PIN" });
              }}
            >
              <RiHomeFill /> Home
            </div>
            <h3 className="mt-5 text-base 2xl:text-xl">
              Discover Categories
            </h3>
            {categories.slice(0, categories.length - 1).map((category, i) => (
              <div
                className={`${classHandler(i + 1)} cursor-pointer`}
                onClick={() => {
                  setActive(i + 1);
                  setToggleSideBar(false);
                  dispatch({ type: "FILTER_BY_CATEGORY", payload: categories.name });
                }}
                key={i}
              >
                {category.name}
              </div>
            ))}
            {user && (
              <Link
                to={`user-profile/${user._id}`}
                className="flex my-5 mb-3 p-2 gap-2 items-center rounded-lg shadow-lg bg-white"
              >
                <UserAvatar user={user} size="lg" border />
                <p className="capitalize text-base font-bold text-red-500">{`${user.firstName} ${user.lastName}`}</p>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  };

  

  return (
      <div className="flex flex-col duration-75 md:w-[25%]">
        {/* Large Screens Sidebar */}
        <div className="hidden md:flex w-full">
          <SidebarContent />
        </div>

        {/* sm Sidebar */}
        {toggleSideBar && (
          <div className="w-4/5 h-full bg-white overflow-y-auto shadow-md z-10 animate-slide-in absolute top-0 left-0  ease-in-out scrollbar-hide">
            <div className="flex w-full flex-end items-center pt-2 justify-end mb-[-55px] relative">
              <AiFillCloseCircle
                fontSize={30}
                className="cursor-pointer"
                onClick={() => {
                  setToggleSideBar(false);
                }}
              />
            </div>
            <SidebarContent />
          </div>
        )}
      </div>
  );
};

export default SideBar;
