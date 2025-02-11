import CONFIG_KEYS from "../../../config";
import authInstanceAxios from "../../middlewares/interceptor";

export const tasks = async (endpoint, page, limit, search, sort, filters) => {
    const response = await authInstanceAxios.get(
        `${CONFIG_KEYS.API_BASE_URL}/${endpoint}`,
        {
            params: { page, limit, search, sort, filters },
            withCredentials: true,
        },
        { withCredentials: true }
    );
    return response;
};

export const addTask = async (endpoint, taskData) => {
    const response = await authInstanceAxios.post(
        `${CONFIG_KEYS.API_BASE_URL}/${endpoint}`,
        taskData,
        { withCredentials: true }
    );
    return response;
};

export const editTask = async (endpoint, taskData) => {
    const response = await authInstanceAxios.put(
        `${CONFIG_KEYS.API_BASE_URL}/${endpoint}`,
        taskData,
        { withCredentials: true }
    );
    return response;
};

export const taskDelete = async (endpoint) => {
    const response = await authInstanceAxios.delete(
        `${CONFIG_KEYS.API_BASE_URL}/${endpoint}`,
        { withCredentials: true }
    );
    return response;
};

export const taskStatistics4Graph = async (endpoint) => {
    const response = await authInstanceAxios.get(
        `${CONFIG_KEYS.API_BASE_URL}/${endpoint}`,
        { withCredentials: true }
    );
    return response;
};

export const groupCreate = async (endpoint, groupData) => {
    const response = await authInstanceAxios.post(
        `${CONFIG_KEYS.API_BASE_URL}/${endpoint}`,
        groupData,
        { withCredentials: true }
    );
    return response;
}

export const groupFetch = async (endpoint) => {
    const response = await authInstanceAxios.get(
        `${CONFIG_KEYS.API_BASE_URL}/${endpoint}`,
        { withCredentials: true }
    );
    return response;
}

export const groupTasks = async (endpoint) => {
    const response = await authInstanceAxios.get(
        `${CONFIG_KEYS.API_BASE_URL}/${endpoint}`,
        { withCredentials: true }
    );
    return response;
}

export const members = async (endpoint) => {
    const response = await authInstanceAxios.get(
        `${CONFIG_KEYS.API_BASE_URL}/${endpoint}`,
        { withCredentials: true }
    );
    return response;
}

export const memberAdd = async (endpoint, members) => {
    const response = await authInstanceAxios.post(
        `${CONFIG_KEYS.API_BASE_URL}/${endpoint}`,
        { members },
        { withCredentials: true }
    );
    return response;
}

export const invitations = async (endpoint) => {
    const response = await authInstanceAxios.get(
        `${CONFIG_KEYS.API_BASE_URL}/${endpoint}`,
        { withCredentials: true }
    );
    return response;
}

export const invitationResponse = async (endpoint, invitationId, status) => {
    return await authInstanceAxios.post(
        `${CONFIG_KEYS.API_BASE_URL}/${endpoint}`,
        { invitationId, status },
        { withCredentials: true }
    );

}
