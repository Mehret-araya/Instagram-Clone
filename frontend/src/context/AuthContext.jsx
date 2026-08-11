import {
  createContext,
  useEffect,
  useState,
} from "react";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      return null;
    }

    const parsedUser = JSON.parse(savedUser);

    const normalizedUser = {
      ...parsedUser,
      _id: parsedUser._id || parsedUser.id,
      id: parsedUser.id || parsedUser._id,
    };

    return normalizedUser;
  });

  const login = (userData) => {
    const normalizedUser = {
      ...userData,
      _id: userData._id || userData.id,
      id: userData.id || userData._id,
    };

    setUser(normalizedUser);

    localStorage.setItem(
      "user",
      JSON.stringify(normalizedUser)
    );
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
