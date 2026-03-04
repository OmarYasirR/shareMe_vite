import React, { useState } from "react";
import SideBar from "../components/SideBar";
import Navbar from "../components/Navbar";

const Layout = ({ children }) => {
  const [toggleSideBar, setToggleSideBar] = useState(false);

  return (
    <div className="w-full h-full flex justify-center items-center relative">
      <div className='w-full container m-auto flex flex-start flex-row '>
        <SideBar
          setToggleSideBar={setToggleSideBar}
          toggleSideBar={toggleSideBar}
        />
        <div className="flex flex-col w-full h-screen">
          <Navbar setToggleSideBar={setToggleSideBar} />

          <div className="w-full h-full overflow-y-auto scrollbar relative">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
