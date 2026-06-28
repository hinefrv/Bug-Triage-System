const API_BASE_URL = 'http://localhost:8080/api/v1';

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

export const fetchIncidents = async () => {
    const response = await fetch(`${API_BASE_URL}/incidents`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        throw new Error('Failed to fetch incidents');
    }
    return response.json();
};

export const fetchIncidentById = async (id) => {
    const response = await fetch(`${API_BASE_URL}/incidents/${id}`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch incident ${id}`);
    }
    return response.json();
};

export const closeAllBugsInIncident = async (id) => {
    const response = await fetch(`${API_BASE_URL}/incidents/${id}/close-all-bugs`, {
        method: 'POST',
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        throw new Error(`Failed to close all bugs for incident ${id}`);
    }
};

export const updateIncidentStatus = async (id, status) => {
    const response = await fetch(`${API_BASE_URL}/incidents/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
    });
    if (!response.ok) {
        throw new Error(`Failed to update incident status to ${status}`);
    }
    return response.json();
};
