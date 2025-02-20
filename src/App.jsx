import Signup from "./Pages/Signup";
import Login from "./Pages/SignIn";
import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";

const App = () => {
  return (
    <div className=" bg-gray-900 text-white h-screen p-2 relative">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </div>
  );
};

export default App;
