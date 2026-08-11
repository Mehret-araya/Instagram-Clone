import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import api from "../services/api";

import {
  followUser,
  unfollowUser,
} from "../services/followService";

const Profile = () => {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const response = await api.get(
        `/users/profile/${id}`
      );

      console.log(
        "Profile response:",
        response.data
      );

      setUser(response.data.user);

      setPosts(
        response.data.user.posts || []
      );

      const currentUserId =
        localStorage.getItem("userId");

      const alreadyFollowing =
        response.data.user.followers?.some(
          (follower) =>
            follower.toString() === currentUserId
        );

      setIsFollowing(
        alreadyFollowing || false
      );

    } catch (error) {
      console.error(
        "Profile error:",
        error.response?.data ||
          error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await unfollowUser(id);
      } else {
        await followUser(id);
      }

      await fetchProfile();

    } catch (error) {
      console.error(
        "Follow error:",
        error.response?.data ||
          error.message
      );
    }
  };

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (!user) {
    return <p>User not found</p>;
  }

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "30px auto",
        textAlign: "center",
      }}
    >
      <h1>
        {user.username}
      </h1>

      <p>
        {user.bio || "No bio yet"}
      </p>

      <button
        onClick={handleFollow}
        style={{
          padding: "8px 20px",
          marginBottom: "20px",
          cursor: "pointer",
        }}
      >
        {isFollowing
          ? "Unfollow"
          : "Follow"}
      </button>

      <div>
        <span>
          Followers: {user.followers || 0}
        </span>

        {"   "}

        <span>
          Following: {user.following || 0}
        </span>

        {"   "}

        <span>
          Posts: {user.postCount || 0}
        </span>
      </div>

      <h2
        style={{
          marginTop: "30px",
        }}
      >
        Posts
      </h2>

      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, 1fr)",
            gap: "5px",
          }}
        >
          {posts.map((post) => (
            <div key={post._id}>
              {post.image?.url && (
                <img
                  src={post.image.url}
                  alt="Post"
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;

