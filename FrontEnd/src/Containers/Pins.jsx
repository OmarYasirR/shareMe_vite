import React, { useEffect, useState } from "react";
import { usePinsContext } from "../hooks/usePinsContext";
import { useGetPins } from "../hooks/useGetPins";
import { IoMdAdd } from "react-icons/io";
import PinsMasonry from "../components/PinsMasonry.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useUserContext } from "../hooks/useUserContext.js";
import Loader from "../components/Loader.jsx";
import Alert from "../components/Alert.jsx";
import { showMore } from "../api/index.js";

const Pins = () => {
  const { pins, error, isLoading, hasMore, loadingMore, fetchPins, dispatch, filteredPins } = usePinsContext();
  const [loadmoreError, setLoadMoreError] = useState(null); 
  const [currentPins, setCurrentPins] = useState(filteredPins.length? filteredPins: pins)
  const { user } = useUserContext();
  const navigate = useNavigate();



  console.log("Context pins:", pins);

  const goToCreatePin = () => {
    
    navigate(user ? '/create-pin' : '/login')
  }
  
    // load more pins
  const loadMorePins = async () => {
    if (!hasMore) return;
    setLoadMoreError(null);
    try {
      dispatch({ type: "LOADING_MORE" });
      const res = await showMore({ page: Math.floor(pins.length / 20) + 1, limit: 20 });
      if (!res.ok) {
        const errorData = await res.json();
        dispatch({ type: "LOAD_MORE_FAILURE", payload: errorData.message || "Failed to load more pins" });
        return;
      }
      const data = await res.json();
      console.log("Load more response:", data); 
      dispatch({ type: "LOAD_MORE", payload: data });
    } catch (err) {
      console.error("Error loading more pins:", err);
      dispatch({ type: "LOAD_MORE_FAILURE", payload: err.message || "Failed to load more pins" });
      setLoadMoreError(err.message || "Failed to load more pins");
    }
  };

  useEffect(() => {
    setCurrentPins(filteredPins.length? filteredPins: pins)
  }, [isLoading])
  

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-2xl h-64 mb-4"></div>
              <div className="space-y-3">
                <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                <div className="flex items-center gap-2">
                  <div className="bg-gray-200 rounded-full h-8 w-8"></div>
                  <div className="bg-gray-200 h-3 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }


  if (error) return (
    <Alert
      message={"Failed to load pins. Please try again."}
      type="error"
      buttonText="Retry"
      onRetry={fetchPins}

      />
  );

  if (currentPins.length === 0) return ( 
    <Alert
      message={"No Pins Available. You can create one!"}
      onRetry={goToCreatePin}
      Icon={IoMdAdd}
      type="info"
      className="h-48 flex flex-col justify-center items-center mx-10 "
      buttonText="Create Pin"
    />
  );

  return (
    <div className="w-full bg-gray-50 relative">
      <PinsMasonry pins={currentPins} hasMore={hasMore} loadingMore={loadingMore} loadMore={loadMorePins} />
      {loadmoreError && (
        <Alert
          message={loadmoreError}
          type="error"
          buttonText="Retry"
          onRetry={loadMorePins}
        />
      )}
    </div>
  );  
};

export default Pins;
