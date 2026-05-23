/**
 * Application Configuration
 * Centralized configuration for the frontend application
 */
const AppConfig = {
    API_BASE_URL: window.__APP_CONFIG__?.apiBaseUrl || window.location.origin + '/api/v1',
    APP_NAME: 'न्यायASTRA - AI Legal Intelligence',
    VERSION: '1.0.0'
};

// For backward compatibility
const API_BASE_URL = AppConfig.API_BASE_URL;
