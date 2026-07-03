// api.js
export const API = "http://localhost:4000";

const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_BASE_URL || API,
  TIMEOUT: 50000,
  MAX_RETRIES: 2,
};

// Helper to get auth token
const getAuthToken = () => {
  try {
    const user = JSON.parse(localStorage.getItem('User'));
    return user?.token || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Helper to get user ID
const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('User'));
    return user?._id || null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

// Enhanced apiRequest with better error handling
const apiRequest = async (endpoint, options = {}) => {
  const { retryCount = 0, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    // Don't set Content-Type for FormData - browser will handle it
    const headers = { ...fetchOptions.headers };
    
    // If body is FormData, remove Content-Type header
    if (fetchOptions.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
      credentials: "include",
    });

    clearTimeout(timeoutId);

    // Handle unauthorized errors
    if (response.status === 401) {
      // Clear invalid token
      localStorage.removeItem('User');
      // You might want to redirect to login here
      console.warn('Unauthorized request - token may be expired');
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    // Retry logic for network errors
    if (error.name === "AbortError") {
      throw new Error("Request timeout. Please check your connection.");
    }

    if (retryCount < API_CONFIG.MAX_RETRIES && !error.status) {
      console.warn(
        `Retrying request (${retryCount + 1}/${API_CONFIG.MAX_RETRIES})...`
      );
      return apiRequest(endpoint, { ...options, retryCount: retryCount + 1 });
    }

    throw error;
  }
};

// User APIs
export const signInUser = async (user) => {
  const response = await apiRequest("/user/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
  return response;
};

export const signUpUser = async (userData) => {
  const response = await apiRequest("/user/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  return response;
};

export const signInWithGoogle = async (userData) => {
  const response = await apiRequest("/user/google", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  return response;
};

export const fetchGoogleUser = async (code) => {
  const response = await apiRequest("/user/google", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });
  return response;
};

export const verifyUser = async (token) => {
  const response = await apiRequest("/user/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
};

export const uploadBanner = async (userId, imageFile) => {
  const token = getAuthToken();
  
  const response = await apiRequest(`/user/${userId}/banner`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: imageFile,
  });
  return response;
};

export const uploadAvatar = async (userId, imageFile) => {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append("avatar", imageFile);

  const response = await apiRequest(`/user/${userId}/avatar`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  return response;
};

// Pins API
const pinsAPI = {
  getAll: async (options = {}) => {
    const queryParams = new URLSearchParams();

    if (options.category) queryParams.append("category", options.category);
    if (options.limit) queryParams.append("limit", options.limit);
    if (options.skip) queryParams.append("skip", options.skip);
    if (options.page) queryParams.append("page", options.page);
    if (options.search) queryParams.append("search", options.search);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/pins?${queryString}` : "/pins";

    return apiRequest(endpoint);  
  },

  getByUser: async (userId, options = {}) => {
    const queryParams = new URLSearchParams();
    if (options.limit) queryParams.append("limit", options.limit);
    if (options.skip) queryParams.append("skip", options.skip);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/pins/user/${userId}?${queryString}` : `/pins/user/${userId}`;
    return apiRequest(endpoint);
  },

  getSavedByUser: async (userId, options = {}) => {
    const queryParams = new URLSearchParams();
    if (options.limit) queryParams.append("limit", options.limit);
    if (options.skip) queryParams.append("skip", options.skip);
    if (options.page) queryParams.append("page", options.page);
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/pins/saved/${userId}?${queryString}` : `/pins/saved/${userId}`;
    return apiRequest(endpoint);
  },

  getById: async (pinId) => {
    return apiRequest(`/pins/${pinId}`);
  },

  getByCategory: async (category, options = {}) => {
    const queryParams = new URLSearchParams();
    if (options.limit) queryParams.append("limit", options.limit);
    if (options.skip) queryParams.append("skip", options.skip);
    if (options.page) queryParams.append("page", options.page);
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/pins/category/${category}?${queryString}` : `/pins/category/${category}`;
    return apiRequest(endpoint);
  },

  create: async (pinData) => {
    const token = getAuthToken();
    
    // Prepare headers - don't set Content-Type for FormData
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return apiRequest("/pins/create", {
      method: "POST",
      headers: headers,
      body: pinData, // pinData should be FormData
    });
  },

  search: async (query) => {
    return apiRequest("/pins/search", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ query }),
    });
  },

  save: async (pinId) => {
    const token = getAuthToken();
    return apiRequest(`/pins/${pinId}/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });
  },

  unsave: async (pinId) => {
    const token = getAuthToken();
    return apiRequest(`/pins/${pinId}/unsave`, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });
  },

  delete: async (pinId) => {
    const token = getAuthToken();
    return apiRequest(`/pins/${pinId}`, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });
  },

  addComment: async (pinId, comment) => {
    const token = getAuthToken();
    const userId = getUserId();
    
    return apiRequest(`/pins/comments`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ 
        comment, 
        pinId, 
        userId 
      }),
    });
  },

  getComments: async (pinId) => {
    return apiRequest(`/pins/${pinId}/comments`);
  },

  editComment: async (pinId, commentId, updatedComment) => {
    const token = getAuthToken();
    const userId = getUserId();
    
    return apiRequest(`/pins/${pinId}/comments/${commentId}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ 
        comment: updatedComment,
        userId 
      }),
    });
  },

  deleteComment: async (pinId, commentId) => {
    const token = getAuthToken();
    
    return apiRequest(`/pins/${pinId}/comments/${commentId}`, {
      method: "DELETE",
      headers: { 
        "Authorization": `Bearer ${token}`
      },
    });
  },

  updatePin: async (pinId, pinData) => {
    const token = getAuthToken();

    console.log("Updating pin with data:", pinData);
    
    // Prepare headers - don't set Content-Type for FormData
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return apiRequest(`/pins/${pinId}`, {
      method: "PUT",
      headers: headers,
      body: pinData, // pinData should be FormData
    });
  },

  like: async (pinId) => {
    const token = getAuthToken();
    return apiRequest(`/pins/${pinId}/like`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
  },

  unlike: async (pinId) => {
    const token = getAuthToken();
    return apiRequest(`/pins/${pinId}/like`, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });
  },
};

// Export all APIs
export const getPins = pinsAPI.getAll;
export const showMore = pinsAPI.showMore;
export const getPinsByUser = pinsAPI.getByUser;
export const getSavedPinsByUser = pinsAPI.getSavedByUser;
export const getPinsByCategory = pinsAPI.getByCategory;
export const getPin = pinsAPI.getById;
export const updatePin = pinsAPI.updatePin;
export const searchPin = pinsAPI.search;
export const createPin = pinsAPI.create;
export const savePin = pinsAPI.save;
export const unSavePin = pinsAPI.unsave;
export const DeletePin = pinsAPI.delete;
export const AddComment = pinsAPI.addComment;
export const EditComment = pinsAPI.editComment;
export const DeleteComment = pinsAPI.deleteComment;
export const getPinComments = pinsAPI.getComments;
export const likePin = pinsAPI.like;
export const unlikePin = pinsAPI.unlike;

export { apiRequest };