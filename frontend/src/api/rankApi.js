import axios from "axios";

export const getRankingTop = async (type) => {
  return axios.get(`/api/rankings/top/${type}`);
};