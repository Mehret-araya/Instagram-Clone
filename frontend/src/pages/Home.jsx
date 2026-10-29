import { useContext, useEffect, useRef, useState } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

const Home = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState({});
  const [savedPosts, setSavedPosts] = useState([]);
  const [pendingLikes, setPendingLikes] = useState({});
  const [likeErrors, setLikeErrors] = useState({});
  const [pendingComments, setPendingComments] = useState({});
  const [pendingCommentDeletes, setPendingCommentDeletes] = useState({});
  const [commentErrors, setCommentErrors] = useState({});
  const pendingLikeIds = useRef(new Set());
  const pendingCommentPostIds = useRef(new Set());
  const pendingCommentIds = useRef(new Set());

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
  if (pendingLikeIds.current.has(postId)) {
    return;
  }

  const currentUserId = getCurrentUserId();
  const post = posts.find((item) => item._id === postId);

  if (!currentUserId || !post) {
    setLikeErrors((previous) => ({
      ...previous,
      [postId]: !currentUserId
        ? "Please log in to like posts."
        : "This post could not be found.",
    }));
    return;
  }

  const alreadyLiked = post.likes?.some(
    (like) => normalizeLikeId(like) === currentUserId.toString()
  );

  pendingLikeIds.current.add(postId);
  setPendingLikes((previous) => ({ ...previous, [postId]: true }));
  setLikeErrors((previous) => ({ ...previous, [postId]: "" }));

  try {
    const response = alreadyLiked
      ? await api.delete(`/likes/${postId}`)
      : await api.post(`/likes/${postId}`);

    if (!Array.isArray(response.data.likes)) {
      throw new Error("The server returned an invalid likes response.");
    }

    setPosts((previousPosts) =>
      previousPosts.map((item) =>
        item._id === postId
          ? { ...item, likes: response.data.likes }
          : item
      )
    );
  } catch (error) {
    console.error("Failed to update post like:", error.response?.data || error);
    setLikeErrors((previous) => ({
      ...previous,
      [postId]:
        error.response?.data?.message ||
        error.message ||
        "Failed to update like. Please try again.",
    }));
  } finally {
    pendingLikeIds.current.delete(postId);
    setPendingLikes((previous) => ({ ...previous, [postId]: false }));
  }
};
             
  
const handleComment = async (postId) => {
  if (pendingCommentPostIds.current.has(postId)) {
    return;
  }

  const text = commentText[postId]?.trim();

  if (!text) {
    setCommentErrors((previous) => ({
      ...previous,
      [postId]: "Comment text is required.",
    }));
    return;
  }

  if (!getCurrentUserId()) {
    setCommentErrors((previous) => ({
      ...previous,
      [postId]: "Please log in to comment.",
    }));
    return;
  }

  pendingCommentPostIds.current.add(postId);
  setPendingComments((previous) => ({ ...previous, [postId]: true }));
  setCommentErrors((previous) => ({ ...previous, [postId]: "" }));

  try {
    const response = await api.post(`/comments/${postId}`, { text });

    if (!Array.isArray(response.data.comments)) {
      throw new Error("The server returned an invalid comments response.");
    }

    setPosts((previousPosts) =>
      previousPosts.map((post) =>
        post._id === postId
          ? { ...post, comments: response.data.comments }
          : post
      )
    );

    setCommentText((previous) => ({ ...previous, [postId]: "" }));
  } catch (error) {
    console.error("Failed to add comment:", error.response?.data || error);
    setCommentErrors((previous) => ({
      ...previous,
      [postId]:
        error.response?.data?.message ||
        error.message ||
        "Failed to add comment. Please try again.",
    }));
  } finally {
    pendingCommentPostIds.current.delete(postId);
    setPendingComments((previous) => ({ ...previous, [postId]: false }));
  }
};

const handleDeleteComment = async (postId, commentId) => {
  if (pendingCommentIds.current.has(commentId)) {
    return;
  }

  pendingCommentIds.current.add(commentId);
  setPendingCommentDeletes((previous) => ({
    ...previous,
    [commentId]: true,
  }));
  setCommentErrors((previous) => ({ ...previous, [postId]: "" }));

  try {
    const response = await api.delete(
      `/comments/${postId}/${commentId}`
    );

    if (!Array.isArray(response.data.comments)) {
      throw new Error("The server returned an invalid comments response.");
    }

    setPosts((previousPosts) =>
      previousPosts.map((post) =>
        post._id === postId
          ? { ...post, comments: response.data.comments }
          : post
      )
    );
  } catch (error) {
    console.error("Failed to delete comment:", error.response?.data || error);
    setCommentErrors((previous) => ({
      ...previous,
      [postId]:
        error.response?.data?.message ||
        error.message ||
        "Failed to delete comment. Please try again.",
    }));
  } finally {
    pendingCommentIds.current.delete(commentId);
    setPendingCommentDeletes((previous) => ({
      ...previous,
      [commentId]: false,
    }));
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
                  (like) => normalizeLikeId(like) === currentUserId?.toString()
                );

                return (
                  <button
                    onClick={() => handleLike(post._id)}
                    disabled={!currentUserId || pendingLikes[post._id]}
                    style={{
                      padding: "8px 15px",
                      border: "none",
                      borderRadius: "5px",
                      backgroundColor: isLikedByCurrentUser
                        ? "#e0245e"
                        : "#0095f6",
                      color: "white",
                      cursor: !currentUserId || pendingLikes[post._id]
                        ? "not-allowed"
                        : "pointer",
                    }}
                  >
                    {pendingLikes[post._id]
                      ? "Updating..."
                      : isLikedByCurrentUser
                        ? "💔 Unlike"
                        : "❤️ Like"}
                  </button>
                );
              })()}

              {likeErrors[post._id] && (
                <p role="alert" style={{ color: "red" }}>
                  {likeErrors[post._id]}
                </p>
              )}

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
    disabled={!getCurrentUserId() || pendingComments[post._id]}
    style={{
      padding:"8px",
      cursor: !getCurrentUserId() || pendingComments[post._id]
        ? "not-allowed"
        : "pointer",
    }}
  >
    {pendingComments[post._id] ? "Commenting..." : "Comment"}
  </button>

  {commentErrors[post._id] && (
    <p role="alert" style={{ color: "red" }}>
      {commentErrors[post._id]}
    </p>
  )}

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

    {normalizeLikeId(comment.user) === getCurrentUserId()?.toString() && (
      <button
        onClick={() => handleDeleteComment(post._id, comment._id)}
        disabled={pendingCommentDeletes[comment._id]}
        style={{
          border: "none",
          background: "transparent",
          color: "red",
          cursor: pendingCommentDeletes[comment._id]
            ? "not-allowed"
            : "pointer",
        }}
      >
        {pendingCommentDeletes[comment._id] ? "Deleting..." : "Delete"}
      </button>
    )}
  </div>
))}

{commentErrors[post._id] && (
  <p role="alert" style={{ color: "red" }}>
    {commentErrors[post._id]}
  </p>
)}

</div>

            </div>


          </div>

        ))

      )}

    </div>
  );
  
};


export default Home;