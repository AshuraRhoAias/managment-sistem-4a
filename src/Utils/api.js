const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const getHeaders = (isFormData = false) => {
    const token = localStorage.getItem('token');
    const headers = {};

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

export const fetchData = async (endpoint) => {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.reload();
            }
            throw new Error('Error en la petición');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export const postData = async (endpoint, data, useFormData = false) => {
    try {
        const body = useFormData ? data : JSON.stringify(data);

        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            headers: getHeaders(useFormData),
            body
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.reload();
            }
            throw new Error('Error en la petición');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export const updateData = async (endpoint, data) => {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.reload();
            }
            throw new Error('Error en la petición');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export const deleteData = async (endpoint) => {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.reload();
            }
            throw new Error('Error en la petición');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};