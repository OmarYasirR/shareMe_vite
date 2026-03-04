export const API = "http://localhost:4000";

const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_BASE_URL || API,
  TIMEOUT: 30000,
  MAX_RETRIES: 2,
};

const apiRequest = async (endpoint, options = {}) => {
  const { retryCount = 0, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      ...fetchOptions,
      signal: controller.signal,
      credentials: "include",
    });

    clearTimeout(timeoutId);
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

export const signInUser = async (user) => {
  const response = await apiRequest("/user/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  return response;
  // const res = await fetch(`${API}/user/signin`,{
  //   method: 'POST',
  //   headers:{
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify(user),
  // })
  // return res
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
  // const response = await fetch(`${API}/user/signup`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(userData),
  // })

  // const data = await response.json();
  // console.log('Signup successful:', data);
  // return data;
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

  console.log(token);
  console.log("verifyUser works");
  const res = await fetch(`${API}/user/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return res;
};

export const uploadBanner = async (userId, imageFile) => {
  const formData = new FormData();
  formData.append("banner", imageFile);
  const res = apiRequest(`/user/${userId}/banner`, {
    method: "POST",
    body: formData,
  })
  return res;

  const response = await fetch(`${API}/user/${userId}/banner`, {
    method: "POST",
    body: formData,
  });

  return response;
};

export const uploadAvatar = async (userId, imageFile) => {
  console.log(imageFile);
  const formData = new FormData();
  formData.append("avatar", imageFile);

  const res = apiRequest(`/user/${userId}/banner`, {
    method: "POST",
    body: formData,
  })
  return res;

  const response = await fetch(`${API}/user/${userId}/avatar`, {
    method: "POST",
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

  showMore: async (options = {}) => {
    const queryParams = new URLSearchParams();

    if (options.limit) queryParams.append("limit", options.limit);
    if (options.skip) queryParams.append("skip", options.skip);
    if (options.page) queryParams.append("page", options.page);

    const queryString = queryParams.toString();
    const endpoint = `/pins?${queryString}`;
    return apiRequest(endpoint);
  },

  getByUser: async (userId, options={}) => {
    const queryParams = new URLSearchParams();
    if (options.limit) queryParams.append("limit", options.limit);
    if (options.skip) queryParams.append("skip", options.skip);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/pins/user/${userId}?${queryString}` : `/pins/user/${userId}`;
    return apiRequest(endpoint);
  },

  getSavedByUser: async (userId, options={}) => {
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

  create: async (pinData) => {
  // Get token before creating FormData
  const user = JSON.parse(localStorage.getItem('User')) 
  const token = user?.token;
  
  // Prepare headers
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return apiRequest("/pins/create", {
    method: "POST",
    headers: headers,
    body: pinData,
  });
},
  search: async (query, options = {}) => {
    return apiRequest("/pins/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, ...options }),
    });
  },

  save: async (pinId, userId) => {
    return apiRequest(`/pins/${pinId}/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${JSON.parse(localStorage.getItem('User'))?.token}`
      },
    });
  },

  unsave: async (pinId, userId) => {
    return apiRequest(`/pins/${pinId}/unsave`, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${JSON.parse(localStorage.getItem('User'))?.token}`
      },
    });
  },

  delete: async (pinId) => {
    return apiRequest(`/pins/${pinId}`, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${JSON.parse(localStorage.getItem('User'))?.token}`
      },
    });
  },

  addComment: async (pinId, comment) => {
    const user = JSON.parse(localStorage.getItem('User')) 
    console.log(user._id)
  const token = user?.token;
    return apiRequest(`/pins/comments`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ comment, pinId, userId: user._id}),
    });
  },

  getComments: async (pinId) => {
    return apiRequest(`/pins/${pinId}/comments`);
  },

  editComment: async (pinId, commentId, updatedComment) => {
    const user = JSON.parse(localStorage.getItem('User'));
    const token = user?.token;
    
    return apiRequest(`/pins/${pinId}/comments/${commentId}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ 
        comment: updatedComment,
        userId: user._id 
      }),
    });
  },

  deleteComment: async (pinId, commentId) => {
    const user = JSON.parse(localStorage.getItem('User'));
    const token = user?.token;
    
    return apiRequest(`/pins/${pinId}/comments/${commentId}`, {
      method: "DELETE",
      headers: { 
        "Authorization": `Bearer ${token}`
      },
    });
  },

  updatePin: async (pinId, pinData) => {
    const user = JSON.parse(localStorage.getItem('User'));
    const token = user?.token;

    console.log("Updating pin with data:", pinData);
    return apiRequest(`/pins/${pinId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: pinData
    });
  },

  like: async (pinId) => {
    return apiRequest(`/pins/${pinId}/like`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${JSON.parse(localStorage.getItem('User'))?.token}`
      }
    });
  },

  unlike: async (pinId) => {
    return apiRequest(`/pins/${pinId}/like`, {
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${JSON.parse(localStorage.getItem('User'))?.token}`
      },
      method: "DELETE",
    });
  },
};

export const getPins = pinsAPI.getAll;
export const showMore = pinsAPI.showMore;
export const getPinsByUser = pinsAPI.getByUser;
export const getSavedPinsByUser = pinsAPI.getSavedByUser;
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
