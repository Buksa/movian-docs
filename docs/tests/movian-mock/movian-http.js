
// Mock HTTP module
const http = {
    request: (url, options = {}) => {
        // Simulate HTTP response
        return {
            statuscode: 200,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ message: 'Mock response', url })
        };
    },
    
    get: (url, options = {}) => {
        return http.request(url, { ...options, method: 'GET' });
    },
    
    post: (url, data, options = {}) => {
        return http.request(url, { ...options, method: 'POST', postdata: data });
    }
};

module.exports = http;
