import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useNavigate, Link, useParams } from "react-router-dom";
import {
  MdSearch,
  MdFilterList,
  MdClose,
  MdImageSearch,
  MdArrowBack,
} from "react-icons/md";
import { searchPin } from "../api";
import BufferToDataURL from "../utils/BufferToDataURL";
import Alert from "../components/Alert";
import Loading from "../components/Loader";
import Spinner from "../components/Spinner";
import PinMasonry from "../components/PinsMasonry";
import { usePinsContext } from "../hooks/usePinsContext";



const Search = () => {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('')
  const [param, setParam] = useState('')
  const navigate = useNavigate();
  

  const { isSearching, searchedPins, error: err } = usePinsContext()

  // Get search term from URL search params
  const queryParam = searchParams.get('q') || '';

  // Update param when queryParam changes
  useEffect(() => {
    setParam(queryParam);
    console.log('param has changed to:', queryParam);
  }, [queryParam]);

  useEffect(() => {
    if (err) {
      setError(err);
    }
  }, [err]);

  

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      
      <div className="container mx-auto px-4 pb-12">
        {/* Search Header */}
        <div className="text-center mb-8 pt-5">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Search Pins
          </h1>
          <p className="text-gray-600">
            Discover amazing ideas from our community
          </p>
        </div>

        {/* Results Section */}
        <div className="mt-8">
          {param && (
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Results for "{param}"
              </h2>
              <span className="text-sm text-gray-500">
                {searchedPins.length} {searchedPins.length === 1 ? "pin" : "pins"} found
              </span>
            </div>
          )}

          {isSearching && (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          )}

          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
            />
          )}

          {!isSearching && !error && param && searchedPins.length === 0 && (
            <div className="text-center py-16">
              <MdImageSearch className="mx-auto text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                No pins found
              </h3>
              <p className="text-gray-500 mb-6">
                Try different keywords or filters
              </p>
              <button
                onClick={() =>{}}
                className="px-6 py-3 bg-pink-500 text-white rounded-full font-medium hover:bg-pink-600 transition-colors inline-flex items-center gap-2"
              >
                Clear Search
              </button>
            </div>
          )}

          {!isSearching && !error && searchedPins.length > 0 && (
            <PinMasonry pins={searchedPins} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;