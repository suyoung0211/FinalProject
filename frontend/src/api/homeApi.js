import api from "./api";

export function fetchHomeData() {
  return api.get("/home");
}