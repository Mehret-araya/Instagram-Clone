import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  console.log("Current logged-in user:", user);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState({});
  const [savedPosts, setSavedPosts] = useState([]);

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


const handleLike = async (postId) => {
  try {
    if (!user?._id) {
      console.error("User is not logged in");
      return;
    }

    const post = posts.find(
      (post) => post._id === postId
    );

    if (!post) {
      return;
    }

    const alreadyLiked = post.likes?.some(
      (like) =>
        like?._id === user._id ||
        like === user._id
    );

    if (alreadyLiked) {
      const response = await api.delete(
        `/likes/${postId}`
      );

      console.log(
        "Unlike response:",
        response.data
      );

      setPosts((previousPosts) =>
        previousPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: post.likes.filter(
                  (like) =>
                    (like?._id || like) !== user._id
                ),
              }
            : post
        )
      );
    } else {
      const response = await api.post(
        `/likes/${postId}`
      );

      console.log(
        "Like response:",
        response.data
      );

      setPosts((previousPosts) =>
        previousPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: [
                  ...(post.likes || []),
                  user._id,
                ],
              }
            : post
        )
      );
    }
  } catch (error) {
    console.error(
      "Like/Unlike error:",
      error.response?.data || error.message
    );
  }
};


const handleComment = async (postId) => {
  try {

    const text = commentText[postId];

    if (!text) {
      return;
    }


    const response = await api.post(
      `/comments/${postId}`,
      {
        text,
      }
    );


    console.log(
      "Comment response:",
      response.data
    );


    setPosts((previousPosts) =>
      previousPosts.map((post) =>
        post._id === postId
          ? {
              ...post,
              comments: response.data.comments,
            }
          : post
      )
    );


    setCommentText({
      ...commentText,
      [postId]: "",
    });


  } catch (error) {

    console.error(
      "Comment error:",
      error.response?.data || error.message
    );

  }
};

const handleSave = async (postId) => {
  try {
    const alreadySaved = savedPosts.includes(postId);

    if (alreadySaved) {
      await api.delete(`/saved/${postId}`);

      setSavedPosts((previous) =>
        previous.filter((id) => id !== postId)
      );
    } else {
      await api.post(`/saved/${postId}`);

      setSavedPosts((previous) => [
        ...previous,
        postId,
      ]);
    }
  } catch (error) {
    console.error(
      "Save error:",
      error.response?.data || error.message
    );
  }
};

  if (loading) {
    return <h2>Loading posts...</h2>;
  }


  if (error) {
    return <h2>{error}</h2>;
  }


  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "20px auto",
      }}
    >

      <h1>Home Feed</h1>


      {posts.length === 0 ? (

        <p>No posts yet.</p>

      ) : (

        posts.map((post) => (

          <div
            key={post._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              marginBottom: "20px",
              overflow: "hidden",
              backgroundColor: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >


            <div
              style={{
                padding: "10px",
                fontWeight: "bold",
              }}
            >
              {post.user?.username || "Unknown User"}
            </div>



            {post.image?.url && (

              <img
                src={post.image.url}
                alt="Post"
                style={{
                  width:"100%",
                  maxHeight:"500px",
                  objectFit:"cover",
                }}
              />

            )}



            <div
              style={{
                padding:"15px",
              }}
            >

              <p>
                {post.caption}
              </p>


              <button
                onClick={() => handleLike(post._id)}
                style={{
                  padding:"8px 15px",
                  border:"none",
                  borderRadius:"5px",
                  backgroundColor:"#0095f6",
                  color:"white",
                  cursor:"pointer",
                }}
              >
                ❤️ Like
              </button>


              <button
  onClick={() => handleSave(post._id)}
  style={{
    padding: "8px 15px",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "#555",
    color: "white",
    cursor: "pointer",
    marginLeft: "10px",
  }}
>
  {savedPosts.includes(post._id)
    ? "🔖 Saved"
    : "🔖 Save"}
</button>


              <p>
                {post.likes?.length || 0} Likes
              </p>


              <div>

  <input
    type="text"
    placeholder="Add a comment..."
    value={commentText[post._id] || ""}
    onChange={(e) =>
      setCommentText({
        ...commentText,
        [post._id]: e.target.value,
      })
    }
    style={{
      padding:"8px",
      width:"70%",
      marginRight:"5px",
    }}
  />


  <button
    onClick={() => handleComment(post._id)}
    style={{
      padding:"8px",
      cursor:"pointer",
    }}
  >
    Comment
  </button>


</div>

<div>


{post.comments?.map((comment) => (
  <div
    key={comment._id}
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "10px",
      padding: "8px",
      borderBottom: "1px solid #eee",
    }}
  >
    <div>
      <strong>
        {comment.user?.username || "User"}
      </strong>

      <p style={{ margin: "4px 0" }}>
        {comment.text}
      </p>
    </div>

    <button
      onClick={() =>
        handleDeleteComment(
          post._id,
          comment._id
        )
      }
      style={{
        border: "none",
        background: "transparent",
        color: "red",
        cursor: "pointer",
      }}
    >
      Delete
    </button>
  </div>
))}

</div>

            </div>


          </div>

        ))

      )}

    </div>
  );
};


export default Home;