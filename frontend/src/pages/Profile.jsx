import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import {
  followUser,
  unfollowUser
} from "../services/followService";

const Profile = () => {

  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);



  useEffect(() => {
    fetchProfile();
  }, []);


  const fetchProfile = async () => {

    try {

      const response = await api.get(`/users/${id}`);

      console.log("Profile response:", response.data);

      setUser(response.data.user);

    } catch (error) {

      console.error(
        "Profile error:",
        error.response?.data || error.message
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


    // Reload latest profile data from database
    fetchProfile();


    // Change button text
    setIsFollowing(!isFollowing);


  } catch(error) {

    console.error(
      "Follow error:",
      error.response?.data || error.message
    );

  }

};   


  if (loading) {
    return <h2>Loading profile...</h2>;
  }


  if (!user) {
    return <h2>User not found</h2>;
  }


  return (

    <div
      style={{
        maxWidth: "600px",
        margin: "30px auto",
        textAlign: "center"
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
>
  {isFollowing ? "Unfollow" : "Follow"}
</button>


      <div>

        <span>
          Followers: {user.followers?.length || 0}
        </span>


        {" "}


        <span>
          Following: {user.following?.length || 0}
        </span>

      </div>


    </div>

  );

};


export default Profile;