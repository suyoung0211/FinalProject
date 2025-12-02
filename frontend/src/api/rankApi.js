import api from "./api";

export const getRankingTop = async (type) => {
  return api.get(`/rankings/top/${type}`, {
    withCredentials: false,
  });
};