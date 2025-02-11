"use client"

import { useState, useEffect } from "react"
import { Users, List, PlusCircle, Edit, Trash2, Check, XCircle, Menu, X, Home, LogOut, Info } from "lucide-react"
import Modal from "react-modal"
import Swal from "sweetalert2"
import { useNavigate } from 'react-router-dom'
import {
    fetchGroup,
    fetchGroupTasks,
    updateTask,
    deleteTask,
    createTask,
    loadMembers,
    addMembers,
    fetchInvitations,
    respondToInvitation,
} from "../../api/endpoints/auth/user-task"
import useSocket from "../../services/socketProvider"
import Cookies from "js-cookie";
import { useDispatch } from "react-redux"
import { logout } from "../../features/auth/authSlice"

const GroupTasks = () => {
    const [groups, setGroups] = useState([])
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [tasks, setTasks] = useState([])
    const [members, setMembers] = useState([])
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
    const [currentTask, setCurrentTask] = useState(null)
    const [currentGroupMembers, setCurrentGroupMembers] = useState([]);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({
        title: "",
        status: "Pending",
        priority: "Medium",
        dueDate: "",
    })
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
    const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false)
    const [availableMembers, setAvailableMembers] = useState([])
    const [selectedMembers, setSelectedMembers] = useState([])
    const [groupInvitations, setGroupInvitations] = useState([])
    const { socket, isConnected } = useSocket();
    console.log(selectedMembers, "{{{{{{{{{")
    const dispatch = useDispatch();
    const navigate = useNavigate();



    // Handle socket events for real-time task updates
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleTaskAdded = (newTask) => {
            if (newTask.groupId === selectedGroup?._id) {
                setTasks((prevTasks) => {
                    if (prevTasks.some((task) => task._id === newTask._id)) return prevTasks;
                    return [...prevTasks, newTask];
                });
            }
        };

        const handleTaskUpdated = (updatedTask) => {
            if (updatedTask.groupId === selectedGroup?._id) {
                setTasks((prevTasks) =>
                    prevTasks.map((task) => (task._id === updatedTask._id ? updatedTask : task))
                );
            }
        };

        const handleTaskDeleted = (deletedTaskId) => {
            setTasks((prevTasks) => prevTasks.filter((task) => task._id !== deletedTaskId));
        };

        // Register socket events
        socket.on("taskAdded", handleTaskAdded);
        socket.on("taskUpdated", handleTaskUpdated);
        socket.on("taskDeleted", handleTaskDeleted);

        // Cleanup socket events on component unmount
        return () => {
            socket.off("taskAdded", handleTaskAdded);
            socket.off("taskUpdated", handleTaskUpdated);
            socket.off("taskDeleted", handleTaskDeleted);
        };
    }, [socket, isConnected, selectedGroup]);



    // Fetch groups on component mount
    // Fetch groups and invitations on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const groupResponse = await fetchGroup()
                if (groupResponse.data.success) {
                    setGroups(groupResponse.data.groups)
                }

                const invitationResponse = await fetchInvitations()
                if (invitationResponse.data.success) {
                    setGroupInvitations(invitationResponse.data.invitations)
                }
                console.log(invitationResponse.data, "$$$$$$$$$")
            } catch (error) {
                console.error("Error fetching data:", error)
            }
        }

        fetchData()
    }, [])
    // Fetch tasks and members when a group is selected
    useEffect(() => {
        if (selectedGroup) {
            const fetchTasks = async () => {
                try {
                    const response = await fetchGroupTasks(selectedGroup._id);
                    if (response.data.success) {
                        setTasks(response.data.tasks);
                        setCurrentGroupMembers(response.data.members || []);
                    }
                } catch (error) {
                    console.error("Error fetching tasks:", error);
                }
            };

            fetchTasks();
        }
    }, [selectedGroup]);


    const handleInvitationResponse = async (invitationId, status) => {
        try {
            const response = await respondToInvitation(invitationId, status);
            console.log(response.data, "response.data");

            if (response.data && response.data.success) {
                Swal.fire("Success!", `Invitation ${status.toLowerCase()} successfully!`, "success");

                // Update the state to remove the processed invitation
                setGroupInvitations((prev) => prev.filter((inv) => inv._id !== invitationId));

                // Refresh groups if the invitation was accepted
                if (status === "Accepted") {
                    const groupResponse = await fetchGroup();
                    if (groupResponse.data.success) {
                        setGroups(groupResponse.data.groups);
                    }
                }
            } else {
                console.warn('Response success is false:', response.data);
                throw new Error(response.message);
            }
        } catch (error) {
            console.error("Error responding to invitation:", error);
            Swal.fire("Error!", "Failed to respond to invitation.", "error");
        }
    };

    const handleLogout = () => {
        Cookies.remove("token");
        Cookies.remove("refreshToken");
        dispatch(logout());
        navigate("/login");
    };

    const navigateToDashboard = () => {
        navigate('/dashboard')
    }




    // Open and close task modal
    const openTaskModal = (task = null) => {
        setCurrentTask(task)
        setNewTask(task ? { ...task } : { title: "", status: "Pending", priority: "Medium", dueDate: "" })
        setIsTaskModalOpen(true)
    }

    const closeTaskModal = () => {
        setIsTaskModalOpen(false)
        setCurrentTask(null)
    }

    // Handle input changes
    const handleTaskInputChange = (e) => {
        setNewTask({ ...newTask, [e.target.name]: e.target.value })
    }

    const handleSaveTask = async () => {
        if (!newTask.title || newTask.title.trim().length < 3) {
            Swal.fire("Error!", "Title must be at least 3 characters long.", "error");
            return;
        }

        if (!newTask.dueDate) {
            Swal.fire("Error!", "Due date is required.", "error");
            return;
        }

        try {
            if (currentTask) {
                // Update existing task
                const response = await updateTask(currentTask._id, newTask);
                socket.emit("taskUpdated", response.data.task); // Emit socket event
                Swal.fire("Success!", "Task updated successfully!", "success");
            } else {
                // Create new task
                const response = await createTask("tasks", { ...newTask, groupId: selectedGroup._id });
                socket.emit("taskAdded", response.data.task); // Emit socket event
                Swal.fire("Success!", "Task created successfully!", "success");
            }

            closeTaskModal();

            // Refresh tasks
            const taskResponse = await fetchGroupTasks(selectedGroup._id);
            if (taskResponse.data.success) {
                setTasks(taskResponse.data.tasks);
            }
        } catch (error) {
            console.error("Error saving task:", error);
            Swal.fire("Error!", "Failed to save task.", "error");
        }
    };

    const handleDeleteTask = async (taskId) => {
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
                    socket.emit("taskDeleted", taskId); // Emit socket event
                    Swal.fire("Deleted!", "Your task has been deleted.", "success");

                    // Refresh tasks
                    const taskResponse = await fetchGroupTasks(selectedGroup._id);
                    if (taskResponse.data.success) {
                        setTasks(taskResponse.data.tasks);
                    }
                } catch (error) {
                    console.error("Error deleting task:", error);
                    Swal.fire("Error!", "Failed to delete task.", "error");
                }
            }
        });
    };

    const openAddMembersModal = async () => {
        try {
            const response = await loadMembers();
            // Filter out existing members and invited members
            const filteredMembers = response.data.users.filter(user =>
                !selectedGroup.members.some(member =>
                    (member._id || member) === user._id
                ) &&
                !selectedGroup.invitations?.some(inv =>
                    inv.userId === user._id
                )
            );
            setAvailableMembers(filteredMembers);
            setSelectedMembers([]);
            setIsAddMembersModalOpen(true);
        } catch (error) {
            console.error("Error loading members:", error);
            Swal.fire("Error!", "Failed to load members.", "error");
        }
    };
    const toggleInfoModal = () => {
        setIsInfoModalOpen(!isInfoModalOpen);
    };


    const handleMemberSelection = (memberId) => {
        setSelectedMembers((prevSelected) =>
            prevSelected.includes(memberId) ? prevSelected.filter((id) => id !== memberId) : [...prevSelected, memberId],
        )
    }

    const handleAddMembers = async () => {
        try {
            const response = await addMembers(selectedGroup._id, selectedMembers);
            console.log(response.data, "*****");
            Swal.fire("Success!", "Members added successfully!", "success");
            setIsAddMembersModalOpen(false);

            // Refresh group members after adding
            const fetchUpdatedTasks = await fetchGroupTasks(selectedGroup._id);
            if (fetchUpdatedTasks.data.success) {
                setMembers(fetchUpdatedTasks.data.members); // Update members list
            }
        } catch (error) {
            console.error("Error adding members:", error);
            Swal.fire("Error!", "Failed to add members.", "error");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Mobile Header with Sidebar Toggle and Navigation */}
            <div className="md:hidden bg-white shadow-md p-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={navigateToDashboard}
                        className="text-gray-600 hover:text-gray-800"
                    >
                        <Home className="h-6 w-6" />
                    </button>
                    <h1 className="text-xl font-bold">Group Tasks</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                        className="text-gray-600 hover:text-gray-800"
                    >
                        {isMobileSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="text-red-500 hover:text-red-700"
                    >
                        <LogOut className="h-6 w-6" />
                    </button>
                </div>
            </div>

            {/* Sidebar - Responsive Layout */}
            <div className={`
                fixed inset-y-0 left-0 transform 
                ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:relative md:translate-x-0 
                w-full sm:w-1/3 lg:w-1/4 
                bg-white shadow-md p-4 
                z-50 md:z-0 
                transition-transform duration-300 ease-in-out
            `}>
                {/* Hidden in mobile view, visible in desktop */}
                <div className="hidden md:flex justify-between items-center mb-4">
                    <button
                        onClick={navigateToDashboard}
                        className="text-gray-600 hover:text-gray-800 flex items-center"
                    >
                        <Home className="h-5 w-5 mr-2" /> Home
                    </button>
                    <button
                        onClick={handleLogout}
                        className="text-red-500 hover:text-red-700 flex items-center"
                    >
                        <LogOut className="h-5 w-5 mr-2" /> Logout
                    </button>
                </div>

                <button
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="md:hidden absolute top-4 right-4"
                >
                    <X className="h-6 w-6" />
                </button>

                <h2 className="text-lg font-bold mb-4 mt-8 md:mt-0">Groups</h2>
                <ul className="space-y-2">
                    {groups.map((group) => (
                        <li
                            key={group._id}
                            onClick={() => {
                                setSelectedGroup(group)
                                setIsMobileSidebarOpen(false)
                            }}
                            className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 ${selectedGroup?._id === group._id
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 hover:bg-gray-200"
                                }`}
                        >
                            <span className="flex justify-between items-center">
                                <span className="flex items-center">
                                    <List className="h-5 w-5 mr-2" />
                                    {group.name}
                                </span>
                                <span className="text-sm text-gray-600">
                                    {group.members.length} members
                                </span>
                            </span>
                        </li>
                    ))}
                </ul>

                {/* Invitations Section */}
                <h2 className="text-lg font-bold mt-8 mb-4">Group Invitations</h2>
                <ul className="space-y-2">
                    {groupInvitations.map((invitation) => (
                        <li
                            key={invitation._id}
                            className="p-3 rounded-lg bg-gray-100 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0"
                        >
                            <div>
                                <p className="font-semibold">{invitation.groupName}</p>
                                <p className="text-sm text-gray-600">
                                    Invited by {invitation.invitedBy?.name || "Unknown"}
                                </p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleInvitationResponse(invitation._id, "Accepted")}
                                    className="text-green-500 hover:text-green-700"
                                >
                                    <Check className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handleInvitationResponse(invitation._id, "Rejected")}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <XCircle className="h-5 w-5" />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Main Content Area - Responsive */}
            <div className="flex-1 bg-white shadow-md p-4 md:p-6 overflow-y-auto">
                {selectedGroup ? (
                    <>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-bold">{selectedGroup.name} Tasks</h2>
                                <button
                                    onClick={toggleInfoModal}
                                    className="text-gray-500 hover:text-gray-700"
                                    title="View Group Members"
                                >
                                    <Info className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                    onClick={() => openTaskModal()}
                                    className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" /> Create Task
                                </button>
                                <button
                                    onClick={openAddMembersModal}
                                    className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                                >
                                    <Users className="mr-2 h-4 w-4" /> Add Members
                                </button>
                            </div>
                        </div>

                        {/* Tasks List - Responsive Grid */}
                        {tasks.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {tasks.map((task) => (
                                    <div
                                        key={task._id}
                                        className="border border-gray-300 rounded-lg p-4 bg-gray-50 hover:shadow-md transition-shadow"
                                    >
                                        <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
                                        {/* <p className="text-sm text-gray-600 mb-3">
                                            {task.description || "No description provided"}
                                        </p> */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">Status:</span>
                                                <span
                                                    className={`inline-block px-3 py-1 text-sm rounded-full ${task.status === "Completed"
                                                        ? "bg-green-100 text-green-800"
                                                        : task.status === "In Progress"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-gray-100 text-gray-800"
                                                        }`}
                                                >
                                                    {task.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">Priority:</span>
                                                <span
                                                    className={`inline-block px-3 py-1 text-sm rounded-full ${task.priority === "High"
                                                        ? "bg-red-100 text-red-800"
                                                        : task.priority === "Medium"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-green-100 text-green-800"
                                                        }`}
                                                >
                                                    {task.priority}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">Due Date:</span>
                                                <span className="text-sm">
                                                    {new Date(task.dueDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">Created At:</span>
                                                <span className="text-sm">
                                                    {new Date(task.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => openTaskModal(task)}
                                                    className="text-blue-500 hover:text-blue-700"
                                                >
                                                    <Edit className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTask(task._id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600 text-center py-10">
                                No tasks available for this group.
                            </p>
                        )}
                    </>
                ) : (
                    <p className="text-gray-600 text-center py-10">
                        Select a group to view its tasks.
                    </p>
                )}
            </div>

            {/* Existing Modal components remain the same */}
            <Modal
                isOpen={isTaskModalOpen}
                onRequestClose={closeTaskModal}
                contentLabel="Task Modal"
                className="fixed inset-0 flex items-center justify-center"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50"
            >
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
                    <h2 className="text-xl font-semibold mb-6">{currentTask ? "Edit Task" : "Add Task"}</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={newTask.title}
                                onChange={handleTaskInputChange}
                                placeholder="Enter task title (min 3 characters)"
                                required
                                className="w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                name="status"
                                value={newTask.status}
                                onChange={handleTaskInputChange}
                                required
                                className="w-full border border-gray-300 rounded-md p-2"
                            >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                                name="priority"
                                value={newTask.priority}
                                onChange={handleTaskInputChange}
                                required
                                className="w-full border border-gray-300 rounded-md p-2"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                            <input
                                type="date"
                                name="dueDate"
                                value={newTask.dueDate}
                                onChange={handleTaskInputChange}
                                min={new Date().toISOString().split("T")[0]}
                                required
                                className="w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 mt-6">
                        <button onClick={closeTaskModal} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                            Cancel
                        </button>
                        <button onClick={handleSaveTask} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                            {currentTask ? "Update Task" : "Create Task"}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={isAddMembersModalOpen}
                onRequestClose={() => setIsAddMembersModalOpen(false)}
                contentLabel="Add Members Modal"
                className="fixed inset-0 flex items-center justify-center"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50"
            >
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
                    <h2 className="text-xl font-semibold mb-6">Add Members</h2>
                    <div className="space-y-4">
                        {availableMembers.map((member) => (
                            <div key={member._id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`member-${member._id}`}
                                    checked={selectedMembers.includes(member._id)}
                                    onChange={() => handleMemberSelection(member._id)}
                                    className="mr-2"
                                />
                                <label htmlFor={`member-${member._id}`}>{member.name}</label>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end space-x-4 mt-6">
                        <button
                            onClick={() => setIsAddMembersModalOpen(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddMembers}
                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                        >
                            Add Selected Members
                        </button>
                    </div>
                </div>
            </Modal>
            <Modal
                isOpen={isInfoModalOpen}
                onRequestClose={() => setIsInfoModalOpen(false)}
                contentLabel="Group Members Info"
                className="fixed inset-0 flex items-center justify-center"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50"
            >
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Group Members</h2>
                        <button
                            onClick={() => setIsInfoModalOpen(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {currentGroupMembers.length > 0 ? (
                            currentGroupMembers.map((member) => (
                                <div
                                    key={member._id}
                                    className="py-2 px-4 hover:bg-gray-50 rounded-md flex items-center justify-between"
                                >
                                    <span>{member.name}</span>
                                    <span className="text-sm text-gray-500">{member.email}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">
                                No members found in this group.
                            </p>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );

}

export default GroupTasks

