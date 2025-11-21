import axios from "axios";

const BASE_URL = "http://localhost:8080";

export const loginApi = async (email, password) => {
  const response = await axios.post(`${BASE_URL}/api/auth/login`, {
    email,
    password,
  });
  return response.data;
};

// ⭐ 로그아웃 API 추가
export const logoutApi = async (token) => {
  return await axios.post(
    `${BASE_URL}/api/auth/logout`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getMyInfoApi = async (token) => {
  const response = await axios.get(`${BASE_URL}/api/user/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const registerApi = async (email, password, nickname) => {
  const res = await axios.post(`${BASE_URL}/api/auth/register`, {
    email,
    password,
    nickname,
  });
  return res.data;
};
