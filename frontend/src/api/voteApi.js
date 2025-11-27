import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
});

export const fetchIssueVotes = async () => {
  const response = await API.get('/issues/votes');
  return response.data;
};