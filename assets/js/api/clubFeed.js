import { javaURI, fetchOptions } from './config.js';

const CLUB_FEED_PATH = '/api/club-feed/posts';

function buildUrl(path = '', params = {}) {
    const url = new URL(javaURI + CLUB_FEED_PATH + path);
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
            url.searchParams.set(key, value);
        }
    });
    return url.toString();
}

async function readJson(response) {
    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Club feed request failed with ${response.status}`);
    }
    if (response.status === 204) return null;
    return response.json();
}

export async function fetchClubPosts({ clubId } = {}) {
    const response = await fetch(buildUrl('', { clubId }), fetchOptions);
    return readJson(response);
}

export async function createClubPost(postData) {
    const response = await fetch(buildUrl(), {
        ...fetchOptions,
        method: 'POST',
        body: JSON.stringify(postData),
    });
    return readJson(response);
}

export async function likeClubPost(postId) {
    const response = await fetch(buildUrl(`/${encodeURIComponent(postId)}/likes`), {
        ...fetchOptions,
        method: 'POST',
    });
    return readJson(response);
}
