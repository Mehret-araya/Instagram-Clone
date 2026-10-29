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

const getCurrentUserId = () => {
  return user?._id || user?.id;
};

const normalizeLikeId = (like) => {
  if (!like) return null;
  if (typeof like === "string") return like;
  if (like._id) return like._id.toString();
  if (like.id) return like.id.toString();
  if (typeof like.toString === "function") return like.toString();
  return null;
};

const handleLike = async (postId) => {
  console.log("LIKE BUTTON CLICKED:", postId);

  try {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      console.error("User is not logged in");
      return;
    }

    const post = posts.find((post) => post._id === postId);

    console.log("POST:", post);
    console.log("CURRENT USER:", user);

    if (!post) {
      console.error("Post not found");
      return;
    }

    const alreadyLiked = post.likes?.some(
      (like) => normalizeLikeId(like) === currentUserId.toString()
    );

    console.log("ALREADY LIKED:", alreadyLiked);

    if (alreadyLiked) {
      const response = await api.delete(`/likes/${postId}`);

      console.log("UNLIKE SUCCESS:", response.data);

      setPosts((previousPosts) =>
        previousPosts.map((p) =>
          p._id !== postId
            ? p
            : {
                ...p,
                likes: p.likes?.filter(
                  (like) => normalizeLikeId(like) !== currentUserId.toString()
                ) || [],
              }
        )
      );
    } else {
      const response = await api.post(`/likes/${postId}`);

      console.log("LIKE SUCCESS:", response.data);

      setPosts((previousPosts) =>
        previousPosts.map((p) =>
          p._id !== postId
            ? p
            : {
                ...p,
                likes: [
                  ...(p.likes ?? []),
                  currentUserId,
                ],
              }
        )
      );
    }

    await fetchPosts();

  } catch (error) {
    console.error(
      "LIKE ERROR STATUS:",
      error.response?.status
    );

    console.error(
      "LIKE ERROR DATA:",
      error.response?.data
    );

    console.error(
      "LIKE ERROR MESSAGE:",
      error.message
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

              {(() => {
                const currentUserId = user?._id || user?.id;
                const isLikedByCurrentUser = post.likes?.some(
                  (like) => like?.toString() === currentUserId?.toString()
                );

                return (
                  <button
                    onClick={() => handleLike(post._id)}
                    style={{
                      padding: "8px 15px",
                      border: "none",
                      borderRadius: "5px",
                      backgroundColor: isLikedByCurrentUser
                        ? "#e0245e"
                        : "#0095f6",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    {isLikedByCurrentUser ? "💔 Unlike" : "❤️ Like"}
                  </button>
                );
              })()}

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