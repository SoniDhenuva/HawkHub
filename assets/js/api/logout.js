import { pythonURI, javaURI, fetchOptions } from './config.js';

// logout from both java and python backends
export async function handleLogout() {
    const requestOptions = {
        ...fetchOptions,
        cache: 'no-store',
        headers: {
            ...fetchOptions.headers,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
        }
    };

    const result = {
        pythonLoggedOut: false,
        javaLoggedOut: false
    };

    // logout from python backend
    try {
        const response = await fetch(pythonURI + '/api/authenticate', {
            ...requestOptions,
            method: 'DELETE'
        });
        result.pythonLoggedOut = response.ok;
        if (!response.ok) {
            console.error('python logout failed with status:', response.status);
        }
    } catch (e) {
        // log error but continue
        console.error('python logout failed:', e);
    }

    // logout from java backend
    try {
        const response = await fetch(javaURI + '/api/logout', {
            ...requestOptions,
            method: 'POST',
        });
        result.javaLoggedOut = response.ok;
        if (!response.ok) {
            console.error('java logout failed with status:', response.status);
        }
    } catch (e) {
        // log error but continue
        console.error('java logout failed:', e);
    }

    return result;
}
