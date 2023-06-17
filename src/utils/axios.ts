import axios from "axios";

const axiosConfig = {
    baseURL: process.env.REACT_APP_API_URL,
  };
  
  export const METHODS = {
    GET: "get",
    DELETE: "delete",
    HEAD: "head",
    OPTIONS: "options",
    POST: "post",
    PUT: "put",
    PATCH: "patch",
  };
  
  function createAxiosInstance() {
    return axios.create(axiosConfig);
  }
  
  const request = createAxiosInstance();
  
request.interceptors.request.use(
    (req) => {
      console.log(req.url);
      
      if (
        !req.headers.Authorization && localStorage.getItem(
          "AUTH_TOKEN"
        )
      ) {
        req.headers.Authorization = `Bearer ${localStorage.getItem(
          "AUTH_TOKEN",
        )}`;
      }
      return req;
    },
    (error) => {}
  );
  
  request.interceptors.response.use(
    (res) => {
      return res;
    },
    (err) => {
      const originalRequest = err.config;
      const status = err.response?.status;
      if (status === 401) {
        const error = {
          originalRequest,
          status,
          message:
            "Session is Expired!",
        };
        localStorage.clear();
        window.location.href='/';
        throw error;
      }
      if (status === 503) {
        const error = {
          originalRequest,
          status,
          message:
            "This service is unavailable right now, please try again later",
        };
        throw error;
      }
      if (status === 500) {
        const error = {
          originalRequest,
          status,
          message: "An unexpected error occurred, please try again later",
        };
        throw error;
      }
      if (status === 404) {
        const error = {
          originalRequest,
          status,
          message: "The requested content does not exist, please try again later",
        };
        throw error;
      }
  
      const response = err.response?.data;
      
      
      const message = response ? response : err.message;
      const error = { originalRequest, message, status };
      throw error;
    }
  );

  export default request