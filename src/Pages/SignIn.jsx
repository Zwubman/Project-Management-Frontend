import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

const Login = () => {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const history = useNavigate();

  // Handle changes in input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (loginData.email === "" || loginData.password === "") {
      alert("Email and password are required");
    } else {
      try {
        const response = await axios.post(
          "https://project-management-backend-fq7q.onrender.com/api/auth/sign-in", // Adjust the endpoint as per your backend setup
          loginData
        );
        console.log(response);
        // You can store the token or any other data in localStorage/sessionStorage
        Cookies.set("authToken", response.data.accessToken, {
          expires: 7,
          secure: true,
          sameSite: "Strict",
        });
        history("/home"); // Redirect to the home page after successful login
      } catch (error) {
        console.error("Login failed:", error);
        alert("Login failed. Please check your credentials.");
      }
    }
  };

  return (
    <div className="h-[98vh] flex items-center justify-center ">
      <div className="p-4 w-2/6 rounded bg-gray-800">
        <div className="text-2xl font-semibold">Signin</div>
        <input
          type="email"
          placeholder="email"
          name="email"
          className="bg-gray-700 px-3 py-2 my-3 w-full rounded"
          value={loginData.email}
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="password"
          name="password"
          className="bg-gray-700 px-3 py-2 my-3 w-full rounded"
          value={loginData.password}
          onChange={handleChange}
        />
        <div className="w-full flex items-center justify-between ">
          <button
            className="bg-blue-400 text-xl font-semibold text-black px-3 py-2 rounded"
            onClick={handleSubmit}
          >
            Login
          </button>
          <Link to="/signup" className="text-gray-400 hover:text-gray-200">
            Not having an account? SignUp here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
