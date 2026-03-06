import React, { useState } from "react";
import { useUserContext } from "../hooks/useUserContext";
import { IoMdSearch } from "react-icons/io";
import { Link, useParams, useNavigate, useLocation} from "react-router-dom";
import { HiMenu } from "react-icons/hi";
import logo from "../assets/logo.png";
import BufferToDataURL from "../utils/BufferToDataURL";
// import DefaultAvater from "./DefaultAvater";
import DefaultAvater from "../assets/default-avatar.png";
import Loader from "./Loader";
import UserAvatar from "./UserAvatar";
import { MdClose, MdSearch } from "react-icons/md";
import { usePinsContext } from "../hooks/usePinsContext";
import { searchPin } from "../api";



const Navbar = ({ setToggleSideBar }) => {
  const [searchTearm, setSearchTearm] = useState("");
  const { user, loading } = useUserContext();
  const isUser = localStorage.getItem("user") !== null;
  const { dispatch } = usePinsContext()
  const navigate = useNavigate();
  const { searchQuery } = useParams()
  
  


  const fetchResults = async (e) => {
  e.preventDefault()
  if (!searchTearm) {
    return;
  }
  
  // Navigate with search param instead of URL param
  navigate(`/search?q=${encodeURIComponent(searchTearm)}`);
  
  dispatch({type: 'START_SEARCHING'})  
  try {
    const response = await searchPin(searchTearm);
    console.log(response)

    if (!response.ok) {
      const errorData = await response.json();
      dispatch({type: 'SEARCH_FAILURE', payload: errorData.message || "Search failed"})
      throw new Error(errorData.message || "Search failed");
    }

    const data = await response.json();
    console.log(data)
    dispatch({type: 'SEARCHIN_SCUCSESS', payload: data})
  } catch (err) {
    dispatch({type: 'SEARCH_FAILURE', payload: err.message || "Search failed"});
    console.error("Search error:", err);
  }
}

  return (
    <div className="flex w-full p-2 justify-center items-center shadow-md mt-2 sm:mt-4 bg-gray-50 gap-2">
      <div className="flex md:hidden justify-center items-center">
        <HiMenu
          fontSize={40}
          className="cursor-pointer"
          onClick={() => {
            setToggleSideBar(true);
          }}
        />
        <Link to="/" className="hidden sm:inline-block">
          <img src={logo} alt="logo" className="w-28" />
        </Link>
      </div>

      {/* Search bar */}
      <div className="flex-1 mx-auto">
        <form onSubmit={fetchResults} className="relative">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="submit"
              className="p-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors"
            >
              <MdSearch className="w-5 h-5" />
            </button>
            {searchTearm && (
              <button
                type="button"
                onClick={() => setSearchTearm('')}
                className="hidden sm:inline-block p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <MdClose className="w-5 h-5" />
              </button>
            )}
          </div>

          <input
            type="text"
            value={searchTearm}
            onChange={(e) => setSearchTearm(e.target.value)}
            placeholder="Search for pins..."
            className="w-full px-5 py-2 pl-14 sm:pl-20 bg-white border border-gray-200 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-lg"
          />
        </form>
      </div>

      {loading ? (
        <Loader className="block h-fit" text="" />
      ) : (
        <div>
          {user ? (
            <Link to={`user-profile/${user._id}`}>
              {user.img ? (
                <UserAvatar user={user} size="md" border={true} />
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
