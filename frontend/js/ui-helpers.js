/**
 * UI Helper Functions
 * Provides consistent loading, error, empty state, and toast patterns
 */

function showLoading(container) {
    if (typeof container === 'string') container = document.querySelector(container);
    if (!container) return;
    container.innerHTML = `
        <div class="ui-loading flex flex-col items-center justify-center py-12">
            <div class="animate-spin rounded-full h-10 w-10 border-4 border-amber-200 border-t-amber-600"></div>
            <p class="mt-4 text-gray-500 text-sm">Loading...</p>
        </div>
    `;
}

function hideLoading(container) {
    if (typeof container === 'string') container = document.querySelector(container);
    if (!container) return;
    const loader = container.querySelector('.ui-loading');
    if (loader) loader.remove();
}

function showError(container, message, retryCallback) {
    if (typeof container === 'string') container = document.querySelector(container);
    if (!container) return;
    const retryBtn = retryCallback ? `<button onclick="(${retryCallback.toString()})()" class="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm">Retry</button>` : '';
    container.innerHTML = `
        <div class="ui-error flex flex-col items-center justify-center py-12 text-center">
            <div class="text-red-500 mb-2">
                <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
            </div>
            <p class="text-gray-700 font-medium">${message || 'Something went wrong'}</p>
            ${retryBtn}
        </div>
    `;
}

function showEmpty(container, message) {
    if (typeof container === 'string') container = document.querySelector(container);
    if (!container) return;
    container.innerHTML = `
        <div class="ui-empty flex flex-col items-center justify-center py-12 text-center">
            <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
            </svg>
            <p class="text-gray-500">${message || 'No data available'}</p>
        </div>
    `;
}
