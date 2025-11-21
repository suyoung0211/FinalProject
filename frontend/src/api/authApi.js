import axios from "axios";

const BASE_URL = "http://localhost:8080";

// ⭐ 로그인 API
export const loginApi = async (email, password) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/auth/login`,
      { email, password },
      { withCredentials: false }
    );
    return response.data;
  } catch (error) {
    console.error("🔥 [LOGIN ERROR]");
    console.log("Status:", error.response?.status);
    console.log("Message:", error.response?.data);
    throw error;
  }
};

// ⭐ 내 정보 조회 API (JWT 필요)
export const getMyInfoApi = async (token) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/user/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("🔥 [GET MY INFO ERROR]");
    console.log("Status:", error.response?.status);
    console.log("Message:", error.response?.data);
    throw error;
  }
};

// ⭐ 회원가입 API
export const registerApi = async (email, password, nickname) => {
  try {
    const res = await axios.post("http://localhost:8080/api/auth/register", {
      email,
      password,
      nickname,
    });
    return res.data;
  } catch (error) {
    console.error("🔥 [REGISTER ERROR]");
    console.log("Status:", error.response?.status);
    console.log("Message:", error.response?.data);
    throw error;
  }
};
