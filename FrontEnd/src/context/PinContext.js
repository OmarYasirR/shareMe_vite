import {
  createContext,
  useEffect,
  useReducer,
  useCallback,
  useMemo,
  useContext,
} from "react";
import { getPins } from "../api";

export const PinsContext = createContext();

// Initial state with additional metadata
const initialState = {
  pins: [],
  filteredPins: [], // For filtered results
  categories: [], // Unique categories
  isLoading: true,
  error: null,
  selectedCategory: "all",
  searchQuery: "",
  hasMore: false,
  totalPins: 0,
  page: 1, // For pagination
  loadingMore: false,
};

export const pinsReducer = (state, action) => {
  switch (action.type) {
    case "SET_PINS":
      return {
        ...state,
        pins: action.payload.pins.reverse() || [],
        totalPins: action.payload.total || action.payload.pins?.length || 0,
        categories: Array.from(
          new Set(action.payload.pins?.map((pin) => pin.category) || []),
        ),
        isLoading: false,
        error: null,
        hasMore:
          action.payload.hasMore !== undefined
            ? action.payload.hasMore
            : (action.payload.pins?.length || 0) >= 20,
      };

    case "LOAD_MORE":
      return {
        ...state,
        pins: [...state.pins, ...(action.payload.data || [])],
        totalPins: state.pins.length + (action.payload.pins?.length || 0),
        loadingMore: false,
        hasMore:
          action.payload.hasMore !== undefined ? action.payload.hasMore : true,
        error: null,
      };

    case "CREATE_PIN":
      const newPin = action.payload;
      const updatedCategories = [...state.categories];
      if (!updatedCategories.includes(newPin.category)) {
        updatedCategories.push(newPin.category);
      }

      return {
        ...state,
        pins: [newPin, ...state.pins],
        filteredPins:
          state.selectedCategory === "all" ||
          state.selectedCategory === newPin.category
            ? [newPin, ...state.filteredPins]
            : state.filteredPins,
        categories: updatedCategories,
        totalPins: state.totalPins + 1,
      };

    case "DELETE_PIN":
      const deletedPin = action.payload;
      return {
        ...state,
        pins: state.pins.filter((pin) => pin._id !== deletedPin._id),
        filteredPins: state.filteredPins.filter(
          (pin) => pin._id !== deletedPin._id,
        ),
        totalPins: Math.max(0, state.totalPins - 1),
      };

    case "UPDATE_PIN":
      return {
        ...state,
        pins: state.pins.map((pin) =>
          pin._id === action.payload._id ? { ...pin, ...action.payload } : pin,
        ),
        filteredPins: state.filteredPins.map((pin) =>
          pin._id === action.payload._id ? { ...pin, ...action.payload } : pin,
        ),
      };

    case "FILTER_BY_CATEGORY":
      const category = action.payload;
      return {
        ...state,
        selectedCategory: category,
        filteredPins:
          category === "all"
            ? state.pins
            : state.pins.filter((pin) => pin.category === category),
      };

    case "SEARCH_PINS":
      const query = action.payload.toLowerCase();
      return {
        ...state,
        searchQuery: query,
        filteredPins:
          query === ""
            ? state.pins
            : state.pins.filter(
                (pin) =>
                  pin.title?.toLowerCase().includes(query) ||
                  pin.about?.toLowerCase().includes(query) ||
                  pin.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
                  pin.category?.toLowerCase().includes(query),
              ),
      };

    case "ADD_COMMENT":
      const { pinId, comment } = action.payload;
      return {
        ...state,
        pins: state.pins.map((pin) => {
          if (pin._id === pinId) {
            return {
              ...pin,
              comments: [...(pin.comments || []), comment],
              commentsCount: (pin.comments?.length || 0) + 1,
            };
          }
          return pin;
        }),
        filteredPins: state.filteredPins.map((pin) => {
          if (pin._id === pinId) {
            return {
              ...pin,
              comments: [...(pin.comments || []), comment],
              commentsCount: (pin.comments?.length || 0) + 1,
            };
          }
          return pin;
        }),
      };

    case "UPDATE_COMMENT":
      const {
        pinId: updatePinId,
        commentId,
        comment: updatedComment,
      } = action.payload;
      console.log("Reducer UPDATE_COMMENT payload:", action.payload);
      return {
        ...state,
        pins: state.pins.map((pin) => {
          if (pin._id === updatePinId) {
            return {
              ...pin,
              comments:
                pin.comments?.map((comment) =>
                  comment._id === commentId
                    ? {
                        ...comment,
                        comment: updatedComment,
                        editedAt: new Date().toISOString(),
                      }
                    : comment,
                ) || [],
              commentsCount: pin.comments?.length || 0,
            };
          }
          return pin;
        }),
        filteredPins: state.filteredPins.map((pin) => {
          if (pin._id === updatePinId) {
            return {
              ...pin,
              comments:
                pin.comments?.map((comment) =>
                  comment._id === commentId
                    ? {
                        ...comment,
                        comment: updatedComment.comment || updatedComment,
                        editedAt:
                          updatedComment.editedAt || new Date().toISOString(),
                      }
                    : comment,
                ) || [],
              commentsCount: pin.comments?.length || 0,
            };
          }
          return pin;
        }),
      };

    case "DELETE_COMMENT":
      const { pinId: deletePinId, commentId: deleteCommentId } = action.payload;
      return {
        ...state,
        pins: state.pins.map((pin) => {
          if (pin._id === deletePinId) {
            const filteredComments =
              pin.comments?.filter(
                (comment) => comment._id !== deleteCommentId,
              ) || [];
            console.log(filteredComments);
            return {
              ...pin,
              comments: filteredComments,
              commentsCount: filteredComments.length,
            };
          }
          return pin;
        }),
        filteredPins: state.filteredPins.map((pin) => {
          if (pin._id === deletePinId) {
            const filteredComments =
              pin.comments?.filter(
                (comment) => comment._id !== deleteCommentId,
              ) || [];
            return {
              ...pin,
              comments: filteredComments,
              commentsCount: filteredComments.length,
            };
          }
          return pin;
        }),
      };

    case "TOGGLE_LIKE":
      const { pinId: likePinId, userId } = action.payload;
      return {
        ...state,
        pins: state.pins.map((pin) => {
          if (pin._id === likePinId) {
            const isLiked = pin.likes?.includes(userId);
            const updatedLikes = isLiked
              ? pin.likes?.filter((id) => id !== userId) || []
              : [...(pin.likes || []), userId];

            return {
              ...pin,
              likes: updatedLikes,
              likesCount: updatedLikes.length,
            };
          }
          return pin;
        }),
        filteredPins: state.filteredPins.map((pin) => {
          if (pin._id === likePinId) {
            const isLiked = pin.likes?.includes(userId);
            const updatedLikes = isLiked
              ? pin.likes?.filter((id) => id !== userId) || []
              : [...(pin.likes || []), userId];

            return {
              ...pin,
              likes: updatedLikes,
              likesCount: updatedLikes.length,
            };
          }
          return pin;
        }),
      };

    case "TOGGLE_SAVE":
      const { pinId: savePinId, userId: saveUserId } = action.payload;
      return {
        ...state,
        pins: state.pins.map((pin) => {
          if (pin._id === savePinId) {
            const isSaved = pin.save?.includes(saveUserId);
            const updatedSaves = isSaved
              ? pin.save?.filter((id) => id !== saveUserId) || []
              : [...(pin.save || []), saveUserId];

            return {
              ...pin,
              save: updatedSaves,
              savesCount: updatedSaves.length,
            };
          }
          return pin;
        }),
        filteredPins: state.filteredPins.map((pin) => {
          if (pin._id === savePinId) {
            const isSaved = pin.save?.includes(saveUserId);
            const updatedSaves = isSaved
              ? pin.save?.filter((id) => id !== saveUserId) || []
              : [...(pin.save || []), saveUserId];

            return {
              ...pin,
              save: updatedSaves,
              savesCount: updatedSaves.length,
            };
          }
          return pin;
        }),
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case "CLEAR_FILTERS":
      return {
        ...state,
        selectedCategory: "all",
        searchQuery: "",
        filteredPins: state.pins,
        page: 1,
        hasMore: true,
      };

    case "RESET_PINS":
      return {
        ...initialState,
        pins: [],
        filteredPins: [],
      };

    case "LOADING_MORE":
      return { ...state, loadingMore: true, error: null }

    case "LOAD_MORE_FAILURE":
      return {
        ...state,
        loadingMore: false,
        error: action.payload,
      }
    default:
      console.warn(`Unknown action type: ${action.type}`);
      return state;
  }
};

// Custom hook for using pins context
export const usePins = () => {
  const context = useContext(PinsContext);
  if (!context) {
    throw new Error("usePins must be used within a PinsContextProvider");
  }
  return context;
};

export const PinsContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(pinsReducer, initialState);

    // Fetch pins with error handling
  const fetchPins = useCallback(async (limit = 20) => {
    try {
      dispatch({ type: "SET_ERROR", payload: null });
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await getPins({ limit });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch pins: ${response.status} ${response.statusText}`,
        );
      }

      const pins = await response.json();

      dispatch({
        type: "SET_PINS",
        payload: {
          pins: Array.isArray(pins) ? pins : pins.data || [],
          total: pins.total || (Array.isArray(pins) ? pins.length : 0),
          hasMore:
            pins.hasMore !== undefined
              ? pins.hasMore
              : Array.isArray(pins)
                ? pins.length >= limit  
                : false,
        },
      });
    } catch (error) {
      console.error("Error fetching pins:", error);
      dispatch({
        type: "SET_ERROR",
        payload: error.message || "Failed to fetch pins",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // Memoized value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      ...state,
      dispatch,
      // Helper methods
      getPinById: (id) => state.pins.find((pin) => pin._id === id),
      getPinsByUser: (userId) =>
        state.pins.filter((pin) => pin.createdUser?._id === userId),
      getPinsByCategory: (category) =>
        state.pins.filter((pin) => pin.category === category),
      getSavedPins: (userId) =>
        state.pins.filter((pin) => pin.save?.includes(userId)),
      getLikedPins: (userId) =>
        state.pins.filter((pin) => pin.likes?.includes(userId)),
      hasMorePins: state.hasMore,
      isLoading: state.isLoading,
      fetchPins
    }),
    [state],
  );



  // Initial fetch
  useEffect(() => {
    if (!state.pins.length) {
      fetchPins();
    }
  }, [fetchPins]);

  // Auto-apply filters when pins change
  useEffect(() => {
    if (state.selectedCategory !== "all" || state.searchQuery) {
      if (state.searchQuery) {
        dispatch({ type: "SEARCH_PINS", payload: state.searchQuery });
      }
      if (state.selectedCategory !== "all") {
        dispatch({
          type: "FILTER_BY_CATEGORY",
          payload: state.selectedCategory,
        });
      }
    }
  }, [state.pins, state.selectedCategory, state.searchQuery]);

  return (
    <PinsContext.Provider value={contextValue}>{children}</PinsContext.Provider>
  );
};
