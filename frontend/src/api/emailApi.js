import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api/email",
});

// 1) 인증코드 보내기
export const sendEmailCodeApi = (email) =>
  API.post("/send", { email });

// 2) 인증코드 검증
export const verifyEmailCodeApi = (email, code) =>
  API.post("/verify", { email, code });
