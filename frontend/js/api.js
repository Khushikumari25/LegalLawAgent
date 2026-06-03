/**
 * API Utility Module
 * Handles all API requests with authentication
 */

// API_BASE_URL is defined in config.js which must be loaded before this file

class APIClient {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.accessToken = localStorage.getItem('accessToken');
        this.isRefreshing = false;
        this.refreshSubscribers = [];
    }

    // Get authorization headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        return headers;
    }

    // Subscribe to token refresh
    subscribeTokenRefresh(callback) {
        this.refreshSubscribers.push(callback);
    }

    // Notify all subscribers that token has been refreshed
    onTokenRefreshed(newToken) {
        this.refreshSubscribers.forEach(callback => callback(newToken));
        this.refreshSubscribers = [];
    }

    // Attempt to refresh the access token
    async refreshAccessToken() {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            return null;
        }

        try {
            const response = await axios.post(`${this.baseURL}/auth/refresh-token`, {
                refreshToken
            });

            if (response.data.status === 'success' && response.data.data.accessToken) {
                const newToken = response.data.data.accessToken;
                this.accessToken = newToken;
                localStorage.setItem('accessToken', newToken);
                return newToken;
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    // Handle API errors with token refresh
    async handleError(error) {
        if (error.response) {
            // If 401 and we have a refresh token, try to refresh
            if (error.response.status === 401) {
                const refreshToken = localStorage.getItem('refreshToken');
                
                if (refreshToken && !this.isRefreshing) {
                    this.isRefreshing = true;
                    const newToken = await this.refreshAccessToken();
                    this.isRefreshing = false;

                    if (newToken) {
                        this.onTokenRefreshed(newToken);
                        // Retry the original request would need more complex logic
                        // For now, just return the error
                    } else {
                        // Refresh failed, redirect to login
                        localStorage.clear();
                        window.location.href = getLoginPath();
                    }
                } else if (!refreshToken) {
                    // No refresh token, redirect to login
                    localStorage.clear();
                    window.location.href = getLoginPath();
                }
            }
            // Extract error message from response
            const errorMsg = error.response.data?.message || error.response.data?.error || error.response.statusText || 'API request failed';
            throw new Error(errorMsg);
        } else if (error.request) {
            // The request was made but no response was received
            if (error.code === 'ECONNABORTED') {
                throw new Error('Request timeout. The server is taking too long to respond.');
            }
            throw new Error('No response from server. Please check your connection.');
        } else {
            throw new Error(error.message || 'An error occurred');
        }
    }

    // Retry wrapper for transient failures
    async requestWithRetry(method, endpoint, data, options = {}) {
        const maxRetries = options.retries || 2;
        let lastError;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await this[method](endpoint, data);
            } catch (error) {
                lastError = error;
                // Don't retry on client errors (4xx)
                if (error.message && error.message.includes('4')) break;
                // Don't retry on auth errors
                if (error.message && error.message.includes('401')) break;
                // Wait before retry with exponential backoff
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
            }
        }
        throw lastError;
    }

    // Generic GET request
    async get(endpoint) {
        try {
            const response = await axios.get(`${this.baseURL}${endpoint}`, {
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Generic POST request
    async post(endpoint, data) {
        try {
            const response = await axios.post(`${this.baseURL}${endpoint}`, data, {
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Generic PUT request
    async put(endpoint, data) {
        try {
            const response = await axios.put(`${this.baseURL}${endpoint}`, data, {
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Generic DELETE request
    async delete(endpoint) {
        try {
            const response = await axios.delete(`${this.baseURL}${endpoint}`, {
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    // File upload request
    async upload(endpoint, formData) {
        try {
            const headers = {};
            if (this.accessToken) {
                headers['Authorization'] = `Bearer ${this.accessToken}`;
            }

            const response = await axios.post(`${this.baseURL}${endpoint}`, formData, {
                headers,
                timeout: 300000, // 5 minutes timeout for large PDF uploads (2000+ pages)
                maxContentLength: 100 * 1024 * 1024, // 100MB max
                maxBodyLength: 100 * 1024 * 1024 // 100MB max
            });
            return response.data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Auth Methods
    async login(email, password) {
        const response = await this.post('/auth/login', { email, password });
        if (response.data && response.data.accessToken) {
            this.accessToken = response.data.accessToken;
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response;
    }

    async register(userData) {
        const response = await this.post('/auth/register', userData);
        if (response.data && response.data.accessToken) {
            this.accessToken = response.data.accessToken;
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response;
    }

    async logout() {
        try {
            await this.post('/auth/logout');
        } catch (e) {
            // Ignore logout errors
        }
        localStorage.clear();
        window.location.href = getLoginPath();
    }

    // Case Methods
    async getCases(page = 1, limit = 10) {
        return await this.get(`/cases?page=${page}&limit=${limit}`);
    }

    async getCaseById(id) {
        return await this.get(`/cases/${id}`);
    }

    async createCase(formData) {
        return await this.upload('/cases', formData);
    }

    async updateCase(id, data) {
        return await this.put(`/cases/${id}`, data);
    }

    async deleteCase(id) {
        return await this.delete(`/cases/${id}`);
    }

    async searchCases(query) {
        return await this.get(`/cases/search?q=${encodeURIComponent(query)}`);
    }

    // Analysis Methods
    async analyzeCase(caseId) {
        return await this.post(`/analysis/case/${caseId}`);
    }

    async getIPCToBNSMapping(ipcSection) {
        return await this.get(`/analysis/ipc-bns/${ipcSection}`);
    }

    async checkPetitionEligibility(caseId) {
        return await this.post('/analysis/petition-eligibility', { caseId });
    }

    async findSimilarCases(caseId) {
        return await this.get(`/analysis/similar-cases/${caseId}`);
    }

    // Analytics Methods
    async getDashboardStats() {
        return await this.get('/analytics/dashboard');
    }

    async getTrends() {
        return await this.get('/analytics/trends');
    }

    async getStateWiseAnalytics() {
        return await this.get('/analytics/state-wise');
    }

    async getIPCFrequency() {
        return await this.get('/analytics/ipc-frequency');
    }

    async getBNSFrequency() {
        return await this.get('/analytics/bns-frequency');
    }

    // Report Methods
    async generateReport(reportData) {
        return await this.post('/reports/generate', reportData);
    }

    async getAllReports() {
        return await this.get('/reports');
    }

    async downloadReport(reportId) {
        return await this.get(`/reports/${reportId}/download`);
    }

    // Assistant Methods
    async chat(message, context = {}) {
        return await this.post('/assistant/chat', { message, context });
    }

    async getSuggestedPrompts() {
        return await this.get('/assistant/suggestions');
    }
}

// Helper: Get relative path to login page based on current location
function getLoginPath() {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/pages/')) {
        return 'login.html';
    }
    return 'pages/login.html';
}

// Create and export API client instance
const api = new APIClient();

// Check authentication on protected pages
function checkAuth() {
    const token = localStorage.getItem('accessToken');
    const currentPath = window.location.pathname;
    const currentFile = currentPath.split('/').pop() || 'index.html';
    
    // Public pages that don't require auth
    const publicPages = ['index.html', 'login.html', 'signup.html', 'home.html', ''];
    
    if (!token && !publicPages.includes(currentFile)) {
        window.location.href = getLoginPath();
    }
}

// Get current user
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    try {
        return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
        return null;
    }
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format number
function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat('en-US').format(num);
}

// Show toast notification
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300 transform translate-x-full`;
    
    const colors = {
        info: 'bg-blue-600',
        success: 'bg-green-600',
        error: 'bg-red-600',
        warning: 'bg-yellow-600'
    };
    
    toast.classList.add(colors[type] || colors.info);
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.remove('translate-x-full'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { api, checkAuth, getCurrentUser, formatDate, formatNumber, showToast };
}
