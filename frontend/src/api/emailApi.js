import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api/email",
});

// 이메일 인증 코드 발송
export const sendEmailCodeApi = (email) => {
  return API.post(`/send?email=${email}`);
};

// 인증번호 검증
export const verifyEmailCodeApi = (email, code) => {
  return API.post(`/verify`, { email, code });
};

// 인증 상태 확인
export const emailStatusApi = (email) => {
  return API.get(`/status?email=${email}`);
};

// 인증번호 재발송
export const resendEmailApi = (email) => {
  return API.post(`/resend?email=${email}`);
};
