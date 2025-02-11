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
