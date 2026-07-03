import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  MdSearch,
  MdFilterList,
  MdClose,
  MdImageSearch,
  MdArrowBack,
  MdClear,
} from "react-icons/md";
import { searchPin } from "../api";
import Alert from "../components/Alert";
import Loading from "../components/Loader";
import Spinner from "../components/Spinner";
import PinMasonry from "../components/PinsMasonry";
import { usePinsContext } from "../hooks/usePinsContext";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { dispatch, isSearching, searchedPins, error: contextError } = usePinsContext();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [localError, setLocalError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Get search term from URL search params
  const queryParam = searchParams.get('q') || '';

  // Initialize search query from URL param
  useEffect(() => {
    if (queryParam) {
      setSearchQuery(queryParam);
      performSearch(queryParam);
    } else {
      // Clear search results if no query
      dispatch({ type: 'SEARCHIN_SCUCSESS', payload: [] });
      setHasSearched(false);
    }
  }, [queryParam]);

  // Handle context errors
  useEffect(() => {
    if (contextError) {
      setLocalError(contextError);
    }
  }, [contextError]);

  // Perform search
  const performSearch = async (query) => {
    if (!query || query.trim() === '') {
      dispatch({ type: 'SEARCHIN_SCUCSESS', payload: [] });
      setHasSearched(false);
      return;
    }

    try {
      dispatch({ type: 'START_SEARCHING' });
      setLocalError(null);
      
      const response = await searchPin(query.trim());
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to search pins');
      }

      const results = await response.json();
      
      dispatch({ 
        type: 'SEARCHIN_SCUCSESS', 
        payload: Array.isArray(results) ? results : results.data || [] 
      });
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
      dispatch({ 
        type: 'SEARCH_FAILURE', 
        payload: error.message || 'Failed to perform search' 
      });
      setLocalError(error.message || 'Failed to perform search');
    }
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Update URL with search query
      setSearchParams({ q: searchQuery.trim() });
    } else {
      // Clear search
      setSearchParams({});
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
    dispatch({ type: 'SEARCHIN_SCUCSESS', payload: [] });
    setHasSearched(false);
    setLocalError(null);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Optionally search on type (debounced)
    // You can add debouncing here if needed
  };

  // Render loading state
  if (isSearching) {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center min-h-[400px]">
            <Spinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="container mx-auto px-4 pb-12">
        {/* back button */}
        <div className="flex items-center justify-start pt-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <MdArrowBack className="w-5 h-5" />
            Back
          </button>
        </div>

        {/* Search Header */}
        <div className="text-center mb-8 pt-5">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Search Pins
          </h1>
          <p className="text-gray-600">
            Discover amazing ideas from our community
          </p>
        </div>


        {/* Error Alert */}
        {localError && (
          <Alert
            type="error"
            message={localError}
            onClose={() => setLocalError(null)}
            isScreen
          />
        )}

        {/* Results Section */}
        <div className="mt-8">
          {queryParam && (
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Results for "{queryParam}"
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {searchedPins.length} {searchedPins.length === 1 ? "pin" : "pins"} found
                </p>
              </div>
              <button
                onClick={clearSearch}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors inline-flex items-center gap-2 text-sm"
              >
                <MdClear className="w-4 h-4" />
                Clear Results
              </button>
            </div>
          )}

          {!queryParam && !hasSearched && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">
                <MdImageSearch className="mx-auto text-gray-300" />
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                Search for inspiration
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Enter keywords to find pins, categories, or tags that match your interests
              </p>
            </div>
          )}

          {queryParam && searchedPins.length === 0 && !isSearching && !localError && (
            <div className="text-center py-16">
              <MdImageSearch className="mx-auto text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                No pins found
              </h3>
              <p className="text-gray-500 mb-6">
                Try different keywords or browse our categories
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={clearSearch}
                  className="px-6 py-3 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-colors inline-flex items-center gap-2"
                >
                  <MdClear className="w-5 h-5" />
                  Clear Search
                </button>
                <Link
                  to="/"
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
                >
                  <MdArrowBack className="w-5 h-5" />
                  Browse All Pins
                </Link>
              </div>
            </div>
          )}

          {searchedPins.length > 0 && !isSearching && !localError && (
            <PinMasonry 
              pins={searchedPins} 
              hasMore={false}
              loadingMore={false}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;