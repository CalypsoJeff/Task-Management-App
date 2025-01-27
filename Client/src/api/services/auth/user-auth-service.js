import CONFIG_KEYS from "../../../config";
import authInstanceAxios from "../../middlewares/interceptor";
import Cookies from "js-cookie";

export const userLogin = async (endpoint, userData) => {
  const response = await authInstanceAxios.post(
    `${CONFIG_KEYS.API_BASE_URL}/${endpoint}`,
    userData,
    { withCredentials: true }
  );
  console.log("response", response.data);

  Cookies.set("token", response.data.token, { expires: 1 });
  Cookies.set("refreshToken", response.data.refreshToken, { expires: 1 });
  return response;
};

export const register = async (endpoint, userData) => {
  const response = await authInstanceAxios.post(
    `${CONFIG_KEYS.API_BASE_URL}/${endpoint}`,
    userData,
    { withCredentials: true }
  );
  return response;
};

export const verifyOTP = async (endpoint, otpData) => {
  const response = await authInstanceAxios.post(
    `${CONFIG_KEYS.API_BASE_URL}/${endpoint}`,
    otpData,
    { withCredentials: true }
  );
  Cookies.set("token", response.data.token, { expires: 1 });
  Cookies.set("refreshToken", response.data.refreshToken, { expires: 1 });

  return response;
};

export const tasks = async (endpoint, page, limit, search, sort, filters) => {
  const response = await authInstanceAxios.get(
    `${CONFIG_KEYS.API_BASE_URL}/${endpoint}`,
    {
      params: { page, limit, search, sort, filters },
      withCredentials: true,
    },
    { withCredentials: true }
  );
  return response;
};

export const addTask = async (endpoint, taskData) => {
  const response = await authInstanceAxios.post(
    `${CONFIG_KEYS.API_BASE_URL}/${endpoint}`,
    taskData,
    { withCredentials: true }
  );
  return response;
};

export const editTask = async (endpoint, taskData) => {
  const response = await authInstanceAxios.put(
    `${CONFIG_KEYS.API_BASE_URL}/${endpoint}`,
    taskData,
    { withCredentials: true }
  );
  return response;
};

export const taskDelete = async (endpoint) => {
  const response = await authInstanceAxios.delete(
    `${CONFIG_KEYS.API_BASE_URL}/${endpoint}`,
    { withCredentials: true }
  );
  return response;
};

export const taskStatistics4Graph = async (endpoint) => {
  const response = await authInstanceAxios.get(
    `${CONFIG_KEYS.API_BASE_URL}/${endpoint}`,
    { withCredentials: true }
  );
  return response;
};
