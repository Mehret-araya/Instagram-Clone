import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const EditProfile = () => {
  const navigate = useNavigate();

  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await api.put(
        "/users/profile",
        {
          bio,
          website,
        }
      );

      console.log(
        "Profile updated:",
        response.data
      );

      alert("Profile updated successfully");

      navigate("/");

    } catch (error) {
      console.error(
        "Update profile error:",
        error.response?.data ||
          error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to update profile"
      );

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
      }}
    >
      <h1>Edit Profile</h1>

      <form onSubmit={handleSubmit}>

        <div style={{ marginBottom: "15px" }}>
          <label>Bio</label>

          <br />

          <textarea
            value={bio}
            onChange={(e) =>
              setBio(e.target.value)
            }
            placeholder="Write something about yourself..."
            rows="4"
            style={{
              width: "100%",
              padding: "10px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Website</label>

          <br />

          <input
            type="text"
            value={website}
            onChange={(e) =>
              setWebsite(e.target.value)
            }
            placeholder="https://example.com"
            style={{
              width: "100%",
              padding: "10px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          {loading
            ? "Saving..."
            : "Save Changes"}
        </button>

      </form>
    </div>
  );
};

export default EditProfile;

