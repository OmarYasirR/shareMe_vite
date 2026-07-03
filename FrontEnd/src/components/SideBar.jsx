import React, { useEffect, useRef, useState } from "react";
import logo from "../assets/logo.png";
import { useUserContext } from "../hooks/useUserContext";
import { usePinsContext } from "../hooks/usePinsContext";
import { Link, NavLink } from "react-router-dom";
import { RiArrowDownSFill, RiArrowUpSFill, RiHomeFill } from "react-icons/ri";
import { AiFillCloseCircle } from "react-icons/ai";
import { useGetPins } from "../hooks/useGetPins";
import { getPins, getPinsByCategory } from "../api";
import DefaultAvater from "./DefaultAvater";
import UserAvatar from "./UserAvatar";

const isNotActiveStyle =
  "flex items-center gap-1 text-gray-500 hover:text-black transition-all duration-200 ease-in-out capitalize";

const isActiveStyle =
  "flex items-center gap-1 border-r-2 border-amber-500 transition-all duration-200 ease-in-out capitalize bg-amber-100 text-amber-500";

const SideBar = ({ toggleSideBar, setToggleSideBar }) => {
  const [active, setActive] = useState(0);
  const { dispatch, categories, fetchPins, pagination } = usePinsContext();
  const { user } = useUserContext();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentCategorys, setCurrentCategorys] = useState([]);
  let pins;

  
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

  const fileterByCategory = async (category) => {
    console.log("Filtering by category:", category);
    if(!category){
      return;
    }
    try {
      setError(null);
      setLoading(true);
      dispatch({type: 'SET_ERROR', payload: null});
      dispatch({type: 'SET_LOADING', payload: true});
      const res = await getPinsByCategory(category,{page: 1, limit: 10, skip: 0});
      if (!res.ok) {
        throw new Error(data.message || "Failed to filter by category");
      }
      const data = await res.json();
      console.log("Filtered pins by category:", data);
      dispatch({ type: "FILTER_BY_CATEGORY", payload: {...data, category} });
      setLoading(false);
    } catch (error) {
      dispatch({type: 'SET_ERROR', payload: error.message || "Failed to filter by category"});
      setError(error);
      setLoading(false);
    }  finally {
      dispatch({type: 'SET_LOADING', payload: false});
    }
  }


  const scrollRef = useRef();


  const classHandler = (ac, cat) => {
    if (active == ac) {
      return isActiveStyle;
    } else {
      return isNotActiveStyle;
    }
  };


  useEffect(() => {
    console.log(categories);
    setCurrentCategorys(categories.length > 4 ? categories.slice(0, 4) : categories);
  }, [categories.length]);

  const SidebarContent = () => {
    return (
      <div className="flex flex-col justify-between bg-white h-full hide-scrollbar z-50">
        <div className="flex flex-col">
          <Link className="flex gap-2 my-4 pt-1 w-[150px] items-center" to="/">
            <img src={logo} alt="logo" className="w-full" />
          </Link>
          <div className="flex flex-col gap-1">
            <div
              className={`${classHandler(0, "all")}  cursor-pointer p-1`}
              onClick={() => {
                fetchPins();
                setActive(0);
                setToggleSideBar(false);
              }}
            >
              <RiHomeFill className='text-amber-500' /> Home
            </div>
            <h3 className="mt-1 text-base 2xl:text-xl">
              Discover Categories
            </h3>
            <div className="flex flex-col gap-1 overflow-y-auto max-h-[250px] scrollbar">
              {currentCategorys?.map((category, i) => (
                <div
                  className={`${classHandler(i + 1)} cursor-pointer p-1`}
                  onClick={() => {
                    setActive(i + 1);
                    setToggleSideBar(false);
                    fileterByCategory(category);
                  }}
                  key={i}
                >
                  {category}
                </div>
              ))}
            </div>
            {/* show more categories */}
            {categories.length > 4 && (
              <button
                className="text-sm text-gray-500 hover:text-gray-700 transition-all duration-200 ease-in-out bg-gray-100 rounded-lg p-1 flex items-center justify-center gap-1 m-auto w-full"
              >
                {currentCategorys.length > 4 ? (
                  <span 
                    onClick={() => {
                      setCurrentCategorys(prev => prev = categories.slice(0, 4));
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-all duration-200 ease-in-out">
                    <RiArrowUpSFill className="inline-block mr-1" />
                    Show Less
                  </span>
                ) : (
                  <span
                  onClick={() => {
                  setCurrentCategorys(prev => prev = categories);
                }}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-all duration-200 ease-in-out">
                    <RiArrowDownSFill className="inline-block mr-1" />
                    Show More
                  </span>
                )}
              </button>
            )}
            {user && (
              <Link
                to={`user-profile/${user._id}`}
                className="flex p-2 pl-0 gap-2 mt-3 items-center rounded-lg shadow-lg bg-white"
              >
                <UserAvatar user={user} size="sm" border />
                <p className="capitalize text-sm text-red-500">{`${user.firstName} ${user.lastName}`}</p>
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
