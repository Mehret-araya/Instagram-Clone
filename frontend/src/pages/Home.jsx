import { useEffect, useState } from "react";
import api from "../services/api";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await api.get("/posts");

      console.log("Posts response:", response.data);

      const postsData = response.data.posts || response.data;

      setPosts(postsData);

    } catch (error) {
      console.error(
        "Failed to fetch posts:",
        error.response?.data || error.message
      );

      setError("Failed to load posts");

    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return <h2>Loading posts...</h2>;
  }


  if (error) {
    return <h2>{error}</h2>;
  }


  return (
    <div>
      <h1>Home Feed</h1>

      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (

        posts.map((post) => (

          <div
            key={post._id}
            style={{
              border: "1px solid #ccc",
              marginBottom: "20px",
              padding: "15px",
            }}
          >

            <h3>
              {post.user?.username || "Unknown User"}
            </h3>


        {post.image && (
  <img
    src={post.image}
    alt="Post"
    width="300"
  />
)}




            <p>
              {post.caption}
            </p>


          </div>

        ))
      )}

    </div>
  );
};


export default Home;