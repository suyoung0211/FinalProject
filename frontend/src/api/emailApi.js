// src/api/emailApi.js
import api from "./api";

export const sendEmailCodeApi = (email) =>
  api.post("/email/send", { email });

export const verifyEmailCodeApi = (email, code) =>
  api.post("/email/verify", { email, code });
