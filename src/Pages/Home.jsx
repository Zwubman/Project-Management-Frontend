import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Cookies from "js-cookie";
import TaskStatusDropdown from "../components/TaskStatusDropdown";

function formatDate(dateString) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  const date = new Date(dateString);
  return date.toLocaleString("en-US", options);
}

// Example usage
const formattedDate = formatDate("2026-02-25T15:30:00.000Z");
console.log(formattedDate); // Output: Thursday, February 25, 2026, 03:30 PM

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);

  const [taskData, setTaskData] = useState([]);
  const [newTask, setNewTask] = useState([]);
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [isCreateProjectModalOpen, setCreateProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeProject, setActiveProject] = useState(null);

  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const token = Cookies.get("authToken");
  const decodedUser = jwtDecode(token);

  const fetchMembers = async () => {
    try {
      console.log("startign member fetch");
      const response = await axios.get(
        "http://localhost:5000/api/auth/get-members"
      );

      console.log("members: ", response.data);

      setMembers(response.data.members); //
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };
  const fetchProjects = async () => {
    try {
      let endpoint = "";
      const userRole = decodedUser.memberRole;

      // Determine the correct API endpoint based on the role
      if (userRole === "ProjectManager") {
        endpoint = "http://localhost:5000/api/projects/get-pm-project"; // Adjust the endpoint as per your API
        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "Application/json",
          },
        });
        console.log(response);
        setProjects(response.data.projects); // Assuming your response contains a 'projects' key
      } else if (userRole === "Member") {
        endpoint = "http://localhost:5000/api/projects/get-memeber-project"; // Adjust the endpoint for members
        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "Application/json",
          },
        });
        console.log(response);

        setProjects(response.data.projects); // Assuming your response contains a 'projects' key
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };
  const fetchTasks = async () => {
    if (!activeProject) return;

    const endpoint =
      decodedUser.memberRole === "Member"
        ? `http://localhost:5000/api/tasks/get-my-task/${activeProject._id}`
        : `http://localhost:5000/api/tasks/get-tasks/${activeProject._id}`;

    try {
      setIsTasksLoading(true);
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "Application/json",
        },
      });

      console.log(response.data.tasks);
      setTaskData(response.data.tasks);
      console.log("tasks:", taskData);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsTasksLoading(false);
    }
  };

  // Fetch projects on component mount
  useEffect(() => {
    if (decodedUser) {
      fetchProjects();
    }
  }, []);

  // Fetch tasks when `activeProject` changes
  useEffect(() => {
    fetchTasks();
  }, [activeProject]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const [newProjectData, setNewProjectData] = useState({
    title: "",
    desc: "",
    deadline: "",
  });

  const openTaskModal = (project) => {
    setSelectedProject(project);
    setTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setTaskModalOpen(false);
    setNewTask({ title: "", deadline: "", assignedMember: "" });
  };

  const openCreateProjectModal = () => {
    setCreateProjectModalOpen(true);
  };

  const closeCreateProjectModal = () => {
    setCreateProjectModalOpen(false);
    setNewProjectData({ name: "", description: "", deadline: "" });
  };

  const saveTask = async () => {
    console.log(newTask);
    console.log(!!newTask.title, !!newTask.deadline, !!newTask.assignedMember);
    if (!newTask.title || !newTask.deadline || !newTask.assignedMember) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/tasks/create-task`,
        {
          title: newTask.title,
          deadline: newTask.deadline,
          assignedTo: newTask.assignedMember,
          projectId: selectedProject._id, // Pass the project ID
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "Application/json",
          },
        }
      );

      const task = response.data.task; // Assuming backend returns the created task
      console.log(task);
      // // Update projects state
      // setProjects((prevProjects) =>
      //   prevProjects.map((proj) => {
      //     console.log("proj: ", proj);
      //     proj._id === selectedProject._id
      //       ? { ...proj, tasks: [...proj.tasks, newTask] }
      //       : proj;
      //   })
      // );

      // If the current active project matches, update it to refresh the task list
      // if (activeProject?._id === selectedProject._id) {
      //   setActiveProject({
      //     ...selectedProject,
      //     tasks: [...selectedProject.tasks, newTask],
      //   });
      // }

      closeTaskModal();
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to add task. Please try again.");
    }
  };

  const saveProject = async () => {
    if (
      !newProjectData.title ||
      !newProjectData.desc ||
      !newProjectData.deadline
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/projects/create-project",
        newProjectData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "Application/json",
          },
        }
      );
      console.log(response.data);
      // Assuming the API returns the newly created project

      fetchProjects();

      closeCreateProjectModal();
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project");
    }
  };

  const toggleTaskView = (project) => {
    setActiveProject(activeProject?._id === project._id ? null : project);
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      {/* Left Section - Projects List */}
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-6">Welcome, {decodedUser.name}</h1>
        <button
          className="bg-red-600 px-2 h-10 rounded-md"
          onClick={() => {
            Cookies.remove("authToken");
            window.location.href = "/signin"; // Adjust as needed
          }}
        >
          Logout
        </button>
      </div>
      <div className="flex">
        <div className="w-1/2">
          {projects.length !== 0 ? (
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700"
                >
                  <div className=" ">
                    <div className="  flex flex-col justify-between ">
                      <h2
                        className="text-lg font-semibold cursor-pointer hover:text-blue-400"
                        onClick={() => toggleTaskView(project)}
                      >
                        {project.title}
                      </h2>
                      <p className="text-gray-400 break-words whitespace-normal w-full">
                        {project.desc}
                      </p>

                      <p className="text-gray-500 text-sm mt-1">
                        Deadline: {formatDate(project.deadline)}
                      </p>
                    </div>
                    {decodedUser.memberRole == "ProjectManager" && (
                      <button
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={() => openTaskModal(project)}
                      >
                        Add Task
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>You Have No Projects at the moment. add some</p>
          )}
        </div>
        <div className="w-1/2 px-4 flex items-start">
          {activeProject && (
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 w-full">
              <h2 className="text-xl font-semibold mb-4">
                Tasks for {activeProject.title}
              </h2>
              <ul className="space-y-2">
                {isTasksLoading ? (
                  <p className="text-gray-400">Loading...</p>
                ) : taskData.length === 0 ? (
                  <p>This project has no Tasks</p>
                ) : (
                  taskData.map((task, index) => (
                    <li
                      key={index}
                      className="bg-gray-700 p-3 rounded text-sm space-x-2"
                    >
                      <p>
                        <strong>Title:</strong> {task.title}
                      </p>
                      <p>
                        <strong>Deadline:</strong> {formatDate(task.deadline)}
                      </p>
                      <p>
                        <strong>Assigned to:</strong> {task.assignedTo.email}
                      </p>
                      {decodedUser.memberRole === "Member" ? (
                        <TaskStatusDropdown
                          task={task}
                          onUpdate={(taskId, newStatus) => {
                            setTaskData((prevTasks) =>
                              prevTasks.map((t) =>
                                t._id === taskId
                                  ? { ...t, status: newStatus }
                                  : t
                              )
                            );
                          }}
                        />
                      ) : (
                        <p>
                          Task Tracking Info:{" "}
                          <span
                            className={`px-2 py-1 rounded border bg-gray-800 inline-block ${
                              task.status === "NotStarted"
                                ? "text-red-500 border-red-500"
                                : task.status === "Inprogress"
                                ? "text-yellow-500 border-yellow-500"
                                : "text-green-500 border-green-500"
                            }`}
                          >
                            {task.status === "NotStarted"
                              ? "Not Started"
                              : task.status === "Inprogress"
                              ? "In Progress"
                              : "Completed"}
                          </span>
                        </p>
                      )}{" "}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Create Project Button */}
      {decodedUser.memberRole === "ProjectManager" && (
        <button
          className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-full"
          onClick={openCreateProjectModal}
        >
          Create Project
        </button>
      )}

      {/* Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">
              Add Task for {selectedProject?.name}
            </h2>

            <label className="block mb-2">Title</label>
            <input
              type="text"
              className="w-full p-2 mb-3 rounded bg-gray-700 text-white border border-gray-600"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
            />

            <label className="block mb-2">Deadline</label>
            <input
              type="date"
              className="w-full p-2 mb-3 rounded bg-gray-700 text-white border border-gray-600"
              value={newTask.deadline}
              onChange={(e) =>
                setNewTask({ ...newTask, deadline: e.target.value })
              }
            />

            <label className="block mb-2">Assign Member</label>
            <select
              className="w-full p-2 mb-4 rounded bg-gray-700 text-white border border-gray-600"
              value={newTask.assignedMember}
              onChange={(e) =>
                setNewTask({ ...newTask, assignedMember: e.target.value })
              }
            >
              <option value="">Select Member</option>
              {members.map((member) => (
                <option key={member.id} value={member._id}>
                  {member.email}
                </option>
              ))}
            </select>

            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded"
                onClick={closeTaskModal}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded"
                onClick={saveTask}
              >
                Save Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {isCreateProjectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Create New Project</h2>

            <label className="block mb-2">Project Name</label>
            <input
              type="text"
              className="w-full p-2 mb-3 rounded bg-gray-700 text-white border border-gray-600"
              value={newProjectData.title}
              onChange={(e) =>
                setNewProjectData({ ...newProjectData, title: e.target.value })
              }
            />

            <label className="block mb-2">Description</label>
            <textarea
              className="w-full p-2 mb-3 rounded bg-gray-700 text-white border border-gray-600"
              value={newProjectData.desc}
              onChange={(e) =>
                setNewProjectData({
                  ...newProjectData,
                  desc: e.target.value,
                })
              }
            ></textarea>

            <label className="block mb-2">Deadline</label>
            <input
              type="date"
              className="w-full p-2 mb-3 rounded bg-gray-700 text-white border border-gray-600"
              value={newProjectData.deadline}
              onChange={(e) =>
                setNewProjectData({
                  ...newProjectData,
                  deadline: e.target.value,
                })
              }
            />

            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded"
                onClick={closeCreateProjectModal}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded"
                onClick={saveProject}
              >
                Save Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
