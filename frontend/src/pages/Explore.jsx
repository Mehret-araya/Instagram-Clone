import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Explore = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [hashtagPosts, setHashtagPosts] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load recent searches when Explore opens
  useEffect(() => {
    fetchRecentSearches();
  }, []);

  const fetchRecentSearches = async () => {
    try {
      const response = await api.get("/search/recent");

      setRecentSearches(
        response.data.recentSearches || []
      );
    } catch (error) {
      console.error(
        "Recent searches error:",
        error.response?.data || error.message
      );
    }
  };

  // Search users, posts and hashtags
  const handleSearch = async (e) => {
    const value = e.target.value;

    setSearch(value);

    if (!value.trim()) {
      setUsers([]);
      setPosts([]);
      setHashtagPosts([]);
      return;
    }

    try {
      setLoading(true);

      // Search users
      const response = await api.get(
        `/search/users?q=${value}`
      );

      console.log(
        "Search response:",
        response.data
      );

      setUsers(
        response.data.users || []
      );

      // Search posts
      const postResponse = await api.get(
        `/search/posts?q=${value}`
      );

      console.log(
        "Post search response:",
        postResponse.data
      );

      setPosts(
        postResponse.data.posts || []
      );

      // Search hashtags
      const hashtagResponse = await api.get(
        `/search/hashtags?q=${value}`
      );

      console.log(
        "Hashtag search response:",
        hashtagResponse.data
      );

      setHashtagPosts(
        hashtagResponse.data.posts || []
      );

    } catch (error) {
      console.error(
        "Search error:",
        error.response?.data || error.message
      );

      setUsers([]);
      setPosts([]);
      setHashtagPosts([]);

    } finally {
      setLoading(false);
    }
  };

  // Save search when user presses Enter
  const handleKeyDown = async (e) => {
    if (e.key !== "Enter") {
      return;
    }

    const value = search.trim();

    if (!value) {
      return;
    }

    try {
      const response = await api.post(
        "/search/recent",
        {
          search: value,
        }
      );

      setRecentSearches(
        response.data.recentSearches || []
      );

      console.log(
        "Search saved:",
        response.data
      );

    } catch (error) {
      console.error(
        "Save recent search error:",
        error.response?.data || error.message
      );
    }
  };

  // Search again when clicking a recent search
  const handleRecentSearchClick = async (item) => {
    setSearch(item);

    try {
      setLoading(true);

      // Search users
      const response = await api.get(
        `/search/users?q=${item}`
      );

      setUsers(
        response.data.users || []
      );

      // Search posts
      const postResponse = await api.get(
        `/search/posts?q=${item}`
      );

      setPosts(
        postResponse.data.posts || []
      );

      // Search hashtags
      const hashtagResponse = await api.get(
        `/search/hashtags?q=${item}`
      );

      setHashtagPosts(
        hashtagResponse.data.posts || []
      );

    } catch (error) {
      console.error(
        "Recent search error:",
        error.response?.data || error.message
      );

      setUsers([]);
      setPosts([]);
      setHashtagPosts([]);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "30px auto",
      }}
    >
      <h1>Explore</h1>

      <input
        type="text"
        placeholder="Search users or posts..."
        value={search}
        onChange={handleSearch}
        onKeyDown={handleKeyDown}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "20px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          boxSizing: "border-box",
        }}
      />

      {/* Recent Searches */}
      {!search && recentSearches.length > 0 && (
        <div
          style={{
            marginBottom: "20px",
          }}
        >
          <h2>Recent Searches</h2>

          {recentSearches.map((item, index) => (
            <div
              key={index}
              onClick={() =>
                handleRecentSearchClick(item)
              }
              style={{
                padding: "10px",
                borderBottom: "1px solid #ddd",
                cursor: "pointer",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      )}

      {loading && (
        <p>Searching...</p>
      )}

      {!loading &&
        search &&
        users.length === 0 &&
        posts.length === 0 &&
        hashtagPosts.length === 0 && (
          <p>No results found.</p>
        )}

      {/* Users */}
      {users.length > 0 && (
        <div>
          <h2>Users</h2>

          {users.map((user) => (
            <div
              key={user._id}
              onClick={() =>
                navigate(`/profile/${user._id}`)
              }
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "10px",
                cursor: "pointer",
              }}
            >
              <h3>
                {user.username}
              </h3>

              <p>
                {user.bio || "No bio yet"}
              </p>


              <button
  onClick={(e) => {
    e.stopPropagation();
    navigate(`/messages/${user._id}`);
  }}
  style={{
    marginTop: "8px",
    padding: "8px 14px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  }}
>
  Message
</button>
            </div>
          ))}
        </div>
      )}

      {/* Posts */}
      {posts.length > 0 && (
        <div>
          <h2>Posts</h2>

          {posts.map((post) => (
            <div
              key={post._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                marginBottom: "20px",
                overflow: "hidden",
                backgroundColor: "#fff",
              }}
            >
              {post.image?.url && (
                <img
                  src={post.image.url}
                  alt="Post"
                  style={{
                    width: "100%",
                    maxHeight: "500px",
                    objectFit: "cover",
                  }}
                />
              )}

              <div
                style={{
                  padding: "12px",
                }}
              >
                <h3>
                  {post.user?.username ||
                    "Unknown User"}
                </h3>

                <p>
                  {post.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hashtag Posts */}
      {hashtagPosts.length > 0 && (
        <div>
          <h2>Hashtag Posts</h2>

          {hashtagPosts.map((post) => (
            <div
              key={post._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                marginBottom: "20px",
                overflow: "hidden",
                backgroundColor: "#fff",
              }}
            >
              {post.image?.url && (
                <img
                  src={post.image.url}
                  alt="Hashtag post"
                  style={{
                    width: "100%",
                    maxHeight: "500px",
                    objectFit: "cover",
                  }}
                />
              )}

              <div
                style={{
                  padding: "12px",
                }}
              >
                <h3>
                  {post.user?.username ||
                    "Unknown User"}
                </h3>

                <p>
                  {post.caption}
                </p>

                {post.hashtags?.length > 0 && (
                  <p>
                    {post.hashtags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          marginRight: "8px",
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;

