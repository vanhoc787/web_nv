// API Configuration
// const API_BASE_URL = process.env.NODE_ENV === 'production' 
//     ? 'http://your-production-server.com' 
//     : 'http://localhost:3000';
const API_BASE_URL = 'http://localhost:8000'
//const API_BASE_URL = 'http://10.209.0.250:8000'
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/login`,
    },
    USERS: {
        LIST: `${API_BASE_URL}/users`,
        CREATE: `${API_BASE_URL}/users/create`,
        UPDATE: (id) => `${API_BASE_URL}/users/${id}`,
        TOGGLE_STATUS: (id) => `${API_BASE_URL}/users/${id}/status`,
        DELETE: (id) => `${API_BASE_URL}/users/${id}`,
        CHANGEPASSWORD: (id) => `${API_BASE_URL}/users/${id}/change-password`,
        IMPORT_LOANS: `${API_BASE_URL}/loans/import`
    },
    LOANS: {
        LIST: `${API_BASE_URL}/loans`,
        IMPORT_LOANS: `${API_BASE_URL}/loans/import`
    },
    REPORTS: {
        LOANS: `${API_BASE_URL}/reports/loans`,
        LOANS_EXPORT: `${API_BASE_URL}/reports/loans/export`,
    },
    FORM_GENERATOR: {
        PROGRAMS: `${API_BASE_URL}/form-generator/programs`,
        USERS: `${API_BASE_URL}/form-generator/users`,
        GENERATE: `${API_BASE_URL}/form-generator/generate`,
        USER: (id) => `${API_BASE_URL}/form-generator/users/${id}`,
    },
};

export default API_BASE_URL;
