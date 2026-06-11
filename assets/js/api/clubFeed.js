import { javaURI, fetchOptions } from './config.js';

const BASE = '/api/club-feed/posts';

function url(path = '', params = {}) {
    const u = new URL(javaURI + BASE + path);
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '' && v !== 'all') u.searchParams.set(k, v);
    });
    return u.toString();
}

async function json(res) {
    if (!res.ok) throw new Error((await res.text()) || `${res.status}`);
    if (res.status === 204) return null;
    return res.json();
}

// ── READ ──────────────────────────────────────────────────────────────────────

export async function fetchFeed({ search, postType, clubId } = {}) {
    return json(await fetch(url('', { search, postType, clubId }), fetchOptions));
}

export async function fetchSavedPosts() {
    return json(await fetch(url('/saved'), fetchOptions));
}

// ── CREATE ────────────────────────────────────────────────────────────────────

export async function createFeedPost({ caption, clubIds, postType, tags, images }) {
    return json(await fetch(url(), {
        ...fetchOptions,
        method: 'POST',
        body: JSON.stringify({ caption, clubIds, postType, tags, images }),
    }));
}

// ── INTERACTIONS ──────────────────────────────────────────────────────────────

export async function likePost(postId) {
    return json(await fetch(url(`/${encodeURIComponent(postId)}/like`), {
        ...fetchOptions, method: 'POST',
    }));
}

export async function savePost(postId) {
    return json(await fetch(url(`/${encodeURIComponent(postId)}/save`), {
        ...fetchOptions, method: 'POST',
    }));
}

export async function deletePost(postId) {
    const res = await fetch(url(`/${encodeURIComponent(postId)}`), {
        ...fetchOptions, method: 'DELETE',
    });
    if (res.status === 204) return true;
    return json(res);
}

// ── BACKWARD-COMPAT ALIASES ───────────────────────────────────────────────────

export async function fetchClubPosts({ clubId } = {}) {
    return fetchFeed({ clubId });
}

export async function createClubPost(postData) {
    const clubIds = postData.clubId ? [postData.clubId] : ['general'];
    return createFeedPost({
        caption: postData.description || postData.content || postData.title || '',
        clubIds,
        postType: 'General',
        images: postData.imageUrl ? [postData.imageUrl] : [],
    });
}

export async function likeClubPost(postId) {
    return likePost(postId);
}
