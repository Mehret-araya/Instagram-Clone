import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const CreatePost = () => {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!image) {
      setPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(image);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Create Post button clicked");

    if (!image) {
      alert("Please select an image.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("image", image);
      formData.append("caption", caption);

      const response = await api.post("/posts", formData);

      console.log(response.data);

      alert("Post created successfully!");

      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "40px auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        backgroundColor: "#fff",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        Create New Post
      </h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontWeight: "bold" }}>Select Image</label>
          <br />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>

        {preview && (
          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            <img
              src={preview}
              alt="Preview"
              style={{
                width: "100%",
                maxHeight: "350px",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
          </div>
        )}

        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontWeight: "bold" }}>Caption</label>
          <br />
          <textarea
            rows="4"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#0095f6",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {loading ? "Creating..." : "Create Post"}
        </button>
      </form>

      {image && (
        <p
          style={{
            marginTop: "15px",
            textAlign: "center",
            color: "#555",
          }}
        >
          Selected Image: {image.name}
        </p>
      )}
    </div>
  );
};

export default CreatePost;