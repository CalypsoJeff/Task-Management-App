import END_POINTS from "../../../constants/endpoints";
import { addTask, editTask, groupCreate, groupFetch, groupTasks, invitationResponse, invitations, memberAdd, members, taskDelete, tasks, taskStatistics4Graph } from "../../services/auth/user-task-service";

export const taskList = (id, page, limit, search, sort, filters) => {
    return tasks(END_POINTS.TASKS + `/${id}`, page, limit, search, sort, filters);
};

export const createTask = (id, taskData) => {
    return addTask(END_POINTS.TASKS + `/${id}`, taskData);
};
export const updateTask = (id, taskData) => {
    return editTask(END_POINTS.TASKS + `/${id}`, taskData);
};
export const deleteTask = (id) => {
    return taskDelete(END_POINTS.TASKS + `/${id}`);
};
export const taskStatistics = (id) => {
    return taskStatistics4Graph(END_POINTS.TASKS + `/${id}/statistics`);
}
export const createGroup = (groupData) => {
    return groupCreate(END_POINTS.CREATEGROUP, groupData);
}
export const fetchGroup = () => {
    return groupFetch(END_POINTS.FETCHGROUP,);
}
export const fetchGroupTasks = (id) => {
    return groupTasks(END_POINTS.FETCH_GROUP_TASKS + `/${id}`);
}
export const loadMembers = () => {
    return members(END_POINTS.GET_MEMBERS);
}
export const addMembers = (groupId, members) => {
    return memberAdd(END_POINTS.ADD_MEMBERS + `/${groupId}`, members)
}
export const fetchInvitations = () => {
    return invitations(END_POINTS.FETCH_INVITATIONS)
}
export const respondToInvitation = (invitationId, status) => {
    return invitationResponse(END_POINTS.INVITE_RESPONSE, invitationId, status)
}
