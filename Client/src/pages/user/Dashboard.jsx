import { useEffect, useState, useCallback, useMemo } from "react";
import { PlusCircle, LogOut } from "lucide-react";
import Modal from "react-modal";
import Swal from "sweetalert2";
import {
  createTask,
  deleteTask,
  taskList,
  taskStatistics,
  updateTask,
} from "../../api/endpoints/auth/user-auth";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectUser } from "../../features/auth/authSlice";
import Cookies from "js-cookie";
import { useNavigate } from "react-router";
import TaskStatistics from "../../components/user/TaskStatistics";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(8);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("dueDate:asc");
  const [filters, setFilters] = useState({ priority: "", status: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [statistics, setStatistics] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    status: "Pending",
    priority: "Medium",
    dueDate: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const userId = user._id;

  const fetchTasks = useCallback(async () => {
    try {
      const response = await taskList(
        userId,
        page,
        limit,
        search,
        sort,
        JSON.stringify(filters)
      );
      setTasks(response.data.tasks);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      Swal.fire("Error!", "Failed to fetch tasks.", "error");
    }
  }, [userId, page, limit, search, sort, filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await taskStatistics(userId);
      setStatistics(response.data.statistics);
    } catch (error) {
      console.error("Error fetching task statistics:", error);
    }
  }, [userId]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const openModal = (task = null) => {
    setCurrentTask(task);
    setFormData(
      task
        ? { ...task }
        : { title: "", status: "Pending", priority: "Medium", dueDate: "" }
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentTask(null);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const saveTask = async () => {
    if (!formData.title || formData.title.trim().length < 3) {
      Swal.fire("Error!", "Title must be at least 3 characters long.", "error");
      return;
    }
    if (!formData.dueDate) {
      Swal.fire("Error!", "Due date is required.", "error");
      return;
    }

    const today = new Date();
    const selectedDate = new Date(formData.dueDate);
    if (selectedDate < today.setHours(0, 0, 0, 0)) {
      Swal.fire("Error!", "Due date cannot be in the past.", "error");
      return;
    }
    try {
      if (currentTask) {
        const response = await updateTask(currentTask._id, formData);
        setTasks(
          tasks.map((task) =>
            task._id === currentTask._id ? response.data.task : task
          )
        );
        Swal.fire("Success!", "Task updated successfully!", "success");
      } else {
        const response = await createTask(userId, formData);
        setTasks([...tasks, response.data.task]);
        Swal.fire("Success!", "Task added successfully!", "success");
      }
      closeModal();
      // fetchTasks();
      fetchStatistics();
    } catch (error) {
      console.error("Error saving task:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to save task.";
      Swal.fire("Error!", errorMessage, "error");
    }
  };

  const confirmDeleteTask = (taskId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteTask(taskId);
          setTasks(tasks.filter((task) => task._id !== taskId));
          Swal.fire("Deleted!", "Your task has been deleted.", "success");
          fetchStatistics();
        } catch (error) {
          console.error("Error deleting task:", error);
          const errorMessage =
            error.response?.data?.message || "Failed to delete task.";
          Swal.fire("Error!", errorMessage, "error");
        }
      }
    });
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  const handlePagination = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("refreshToken");
    dispatch(logout());
    navigate("/login");
  };

  const getPriorityColor = useMemo(() => {
    return (priority) => {
      const colors = {
        Low: "bg-green-100 text-green-800",
        Medium: "bg-yellow-100 text-yellow-800",
        High: "bg-red-100 text-red-800",
      };
      return colors[priority] || "";
    };
  }, []);

  const getStatusColor = useMemo(() => {
    return (status) => {
      const colors = {
        Pending: "bg-gray-100 text-gray-800",
        "In Progress": "bg-blue-100 text-blue-800",
        Completed: "bg-green-100 text-green-800",
      };
      return colors[status] || "";
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {user.name || "User"}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={handleSearch}
                className="border border-gray-300 rounded-md px-4 py-2 w-full sm:w-auto"
              />
              <button
                onClick={() => openModal()}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors w-full sm:w-auto"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Create Task
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-colors w-full sm:w-auto"
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap items-center space-x-2 sm:space-x-4 mb-4">
          <select
            value={sort}
            onChange={handleSortChange}
            className="border border-gray-300 rounded-md px-4 py-2 mb-2 sm:mb-0"
          >
            <option value="dueDate:asc">Due Date (Asc)</option>
            <option value="dueDate:desc">Due Date (Desc)</option>
            <option value="priority:asc">Priority (Asc)</option>
            <option value="priority:desc">Priority (Desc)</option>
          </select>

          <select
            name="priority"
            value={filters.priority}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-md px-4 py-2 mb-2 sm:mb-0"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-md px-4 py-2 mb-2 sm:mb-0"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task Statistics */}
          <div className="lg:col-span-1">
            <TaskStatistics statistics={statistics} />
          </div>

          {/* Recent Tasks */}
          <div className="lg:col-span-2 bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Recent Tasks</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      #
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Priority
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Due Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.length > 0 ? (
                    tasks.map((task, index) => (
                      <tr key={task._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(page - 1) * limit + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {task.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              task.status
                            )}`}
                          >
                            {task.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openModal(task)}
                            className="text-indigo-600 hover:text-indigo-900 mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => confirmDeleteTask(task._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                      >
                        No tasks available. Click &quot;Create Task&quot; to add
                        one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <button
                disabled={page === 1}
                onClick={() => handlePagination(page - 1)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => handlePagination(page + 1)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Task Modal"
          className="fixed inset-0 flex items-center justify-center"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-6">
              {currentTask ? "Edit Task" : "Add Task"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter task title (min 3 characters)"
                  required
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {formData.title && formData.title.length < 3 && (
                  <p className="text-red-500 text-sm">
                    Title must be at least 3 characters long.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate ? formData.dueDate.split("T")[0] : ""}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveTask}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                {currentTask ? "Update Task" : "Create Task"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Dashboard;
