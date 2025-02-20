import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const [Data, setData] = useState({
    memberName: "",
    email: "",
    password: "",
    phone: "",
  });
  const navigate = useNavigate(); // Renamed for clarity

  const change = (e) => {
    const { name, value } = e.target;
    setData({ ...Data, [name]: value });
  };

  const submit = async () => {
    if (Data.memberName === "" || Data.email === "" || Data.password === "") {
      alert("All fields are required");
    } else {
      try {
        const response = await axios.post(
          "https://project-management-backend-fq7q.onrender.com/api/auth/sign-up",
          Data
        );
        console.log(response);
        setData({ memberName: "", email: "", password: "", phone: "" }); // Fixed reset
        navigate("/signin"); // Corrected navigation function
      } catch (error) {
        console.error("Error signing up:", error);
        alert("An error occurred while signing up. Please try again.");
      }
    }
  };

  return (
    <div className="h-[98vh] flex items-center justify-center">
      <div className="p-4 w-2/6 rounded bg-gray-800">
        <div className="text-2xl font-semibold">Signup</div>
        <input
          type="text"
          placeholder="Member Name"
          name="memberName"
          className="bg-gray-700 px-3 py-2 my-3 w-full rounded"
          value={Data.memberName}
          onChange={change}
        />
        <input
          type="email"
          placeholder="Email"
          name="email"
          className="bg-gray-700 px-3 py-2 my-3 w-full rounded"
          value={Data.email}
          onChange={change}
        />
        <input
          type="text"
          placeholder="Phone Number"
          name="phone"
          className="bg-gray-700 px-3 py-2 my-3 w-full rounded"
          value={Data.phone}
          onChange={change}
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          className="bg-gray-700 px-3 py-2 my-3 w-full rounded"
          value={Data.password}
          onChange={change}
        />
        <div className="w-full flex items-center justify-between">
          <button
            className="bg-blue-400 text-xl font-semibold text-black px-3 py-2 rounded"
            onClick={submit}
          >
            SignUp
          </button>
          <Link to="/signin" className="text-gray-400 hover:text-gray-200">
            Already have an account? Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
