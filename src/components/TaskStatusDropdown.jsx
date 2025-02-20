/* eslint-disable react/prop-types */
import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const TaskStatusDropdown = ({ task, onUpdate }) => {
  const token = Cookies.get("authToken");
  const [status, setStatus] = useState(task.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;

    console.log(newStatus);
    setStatus(newStatus);
    setIsUpdating(true);

    try {
      await axios.put(
        `http://localhost:5000/api/tasks/update-task-status/${task._id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "Application/json",
          },
        }
      );
      onUpdate(task._id, newStatus); // Update the parent state
    } catch (error) {
      console.error("Error updating task status:", error);
      alert("Failed to update task status");
      setStatus(task.status); // Revert to old status on failure
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center">
      <span className="mr-2">Task Tracking Info:</span>
      <select
        value={status}
        onChange={handleStatusChange}
        disabled={isUpdating}
        className={`px-2 py-1 rounded border bg-gray-800 ${
          status === "NotStarted"
            ? "text-red-500 border-red-500"
            : status === "Inprogress"
            ? "text-yellow-500 border-yellow-500"
            : "text-green-500 border-green-500"
        }`}
      >
        <option value="NotStarted" className="text-red-500">
          Not Started
        </option>
        <option value="Inprogress" className="text-yellow-500">
          In Progress
        </option>
        <option value="Complete" className="text-green-500">
          Completed
        </option>
      </select>
    </div>
  );
};

export default TaskStatusDropdown;
