import api from "./api";

export const followUser = async (userId) => {
  const response = await api.post(`/follow/${userId}`);
  return response.data;
};


export const unfollowUser = async (userId) => {
  const response = await api.delete(`/follow/${userId}`);
  return response.data;
};