// Centralized API client for FastAPI backend
// Uses NEXT_PUBLIC_API_BASE_URL, example: https://your-api.example.com
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export interface TokenResponse { access_token: string; token_type: string; }
export interface UserPublic {
  id: number; username: string; display_name?: string | null; bio?: string | null;
  followers_count: number; following_count: number; posts_count: number;
}
export interface PostPublic {
  id: number;
  author: UserPublic;
  text: string;
  created_at: string;
  updated_at?: string | null;
  edited: boolean;
  original_post_id?: number | null;
  likes_count: number;
  reposts_count: number;
  hashtags: string[];
  liked_by_me?: boolean;
  reposted_by_me: boolean;
}
export interface FeedResponse { items: PostPublic[]; next_offset?: number | null; }

const authHeader = () => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem("bailanysta_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} ${msg}`.trim());
  }

  // 204 No Content — возвращаем undefined
  if (res.status === 204) {
    return undefined as unknown as T;
  }

  // Если нет тела или не JSON — тоже аккуратно обработаем
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await res.text().catch(() => "");
    return (text as unknown) as T;
  }

  // Есть JSON — парсим
  const text = await res.text();
  if (!text) {
    // пустое тело с 2xx
    return undefined as unknown as T;
  }
  return JSON.parse(text) as T;
}

// ---- Auth ----
export async function signup(payload: { username: string; password: string; email?: string; display_name?: string }) {
  return http<UserPublic>(`/auth/signup`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function login(username: string, password: string) {
  // OAuth2 password flow requires x-www-form-urlencoded
  const body = new URLSearchParams({ username, password });
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} ${msg}`.trim());
  }
  return (await res.json()) as TokenResponse;
}

export function saveToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('bailanysta_token', token);
  }
}

export function clearToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('bailanysta_token');
  }
}

export async function getMe() {
  return http<UserPublic>(`/users/me`, { headers: { ...authHeader() } });
}
export async function getUser(username: string) {
  return http<UserPublic>(`/users/${encodeURIComponent(username)}`);
}
export async function follow(username: string) {
  return http<void>(`/users/${encodeURIComponent(username)}/follow`, {
    method: 'POST',
    headers: { ...authHeader() },
  });
}
export async function unfollow(username: string) {
  return http<void>(`/users/${encodeURIComponent(username)}/unfollow`, {
    method: 'POST',
    headers: { ...authHeader() },
  });
}

// ---- Posts & Feeds ----
export async function createPost(text: string) {
  return http<PostPublic>(`/posts`, {
    method: 'POST',
    headers: { ...authHeader() },
    body: JSON.stringify({ text }),
  });
}
export async function editPost(postId: number, text: string) {
  return http<PostPublic>(`/posts/${postId}`, {
    method: 'PATCH',
    headers: { ...authHeader() },
    body: JSON.stringify({ text }),
  });
}
export async function deletePost(postId: number) {
  return http<void>(`/posts/${postId}`, {
    method: 'DELETE',
    headers: { ...authHeader() },
  });
}
export async function likePost(postId: number) {
  return http<void>(`/posts/${postId}/like`, {
    method: 'POST',
    headers: { ...authHeader() },
  });
}
export async function unlikePost(postId: number) {
  return http<void>(`/posts/${postId}/like`, {
    method: 'DELETE',
    headers: { ...authHeader() },
  });
}
export async function repostPost(postId: number) {
  return http<PostPublic>(`/posts/${postId}/repost`, {
    method: 'POST',
    headers: { ...authHeader() },
  });
}

export async function publicFeed(offset = 0, limit = 20) {
  const params = new URLSearchParams({ offset: String(offset), limit: String(limit) });
  return http<FeedResponse>(`/feed/public?${params}`, {
    headers: { ...authHeader() }, // <— ВАЖНО
  });
}

export async function followingFeed(offset = 0, limit = 20) {
  const params = new URLSearchParams({ offset: String(offset), limit: String(limit) });
  return http<FeedResponse>(`/feed/following?${params}`, { headers: { ...authHeader() } });
}

export async function searchPosts(q: string, offset = 0, limit = 20) {
  const params = new URLSearchParams({ q, offset: String(offset), limit: String(limit) });
  return http<FeedResponse>(`/search?${params}`);
}

export async function listPostsByAuthor(username: string, offset=0, limit=50) {
  const params = new URLSearchParams({ author: username, offset: String(offset), limit: String(limit) })
  return http<FeedResponse>(`/posts?${params}`, { headers: { ...authHeader() } })
}
