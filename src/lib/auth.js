// src/lib/auth.js
// Simple JWT-based authentication for Budgetify (Neon backend)

import bcrypt from 'bcryptjs';
import { query, queryOne } from './neon';

const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || 'budgetify-secret-key-change-in-production';
const TOKEN_KEY = 'budgetify_auth_token';
const USER_KEY = 'budgetify_user';

// Simple base64 JWT implementation (for client-side use)
// Note: In production, JWT signing should be done server-side
function createToken(payload) {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })); // 7 days
    const signature = btoa(JWT_SECRET + header + body); // Simplified signature
    return `${header}.${body}.${signature}`;
}

function verifyToken(token) {
    try {
        const [header, body, signature] = token.split('.');
        const expectedSig = btoa(JWT_SECRET + header + body);
        if (signature !== expectedSig) return null;

        const payload = JSON.parse(atob(body));
        if (payload.exp < Date.now()) return null;

        return payload;
    } catch {
        return null;
    }
}

// Get current user from localStorage
export function getCurrentUser() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        return null;
    }

    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
}

// Check if user is authenticated
export function isAuthenticated() {
    return getCurrentUser() !== null;
}

// Register new user
export async function register({ email, password, name }) {
    // Check if user already exists
    const existingUser = await queryOne(
        `SELECT id FROM users WHERE email = $1`,
        [email.toLowerCase()]
    );

    if (existingUser) {
        throw new Error('Bu e-posta adresi zaten kayıtlı');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await query(
        `INSERT INTO users (email, password_hash, full_name, created_at) 
     VALUES ($1, $2, $3, NOW()) 
     RETURNING id, email, full_name`,
        [email.toLowerCase(), passwordHash, name]
    );

    const user = result[0];

    // Create default categories for the user
    await query(
        `INSERT INTO categories (user_id, name, color, emoji, is_default) VALUES 
     ($1, 'Kira & Konut', '#FB923C', '🏠', true),
     ($1, 'Yiyecek & Market', '#F97316', '🍔', true),
     ($1, 'Ulaşım', '#60A5FA', '🚌', true),
     ($1, 'Eğlence', '#A78BFA', '🎮', true),
     ($1, 'Diğer', '#9CA3AF', '🧾', true)`,
        [user.id]
    );

    // Create token and save to localStorage
    const token = createToken({ userId: user.id, email: user.email });
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return { user, token };
}

// Login user
export async function login({ email, password }) {
    const user = await queryOne(
        `SELECT id, email, full_name, password_hash FROM users WHERE email = $1`,
        [email.toLowerCase()]
    );

    if (!user) {
        throw new Error('E-posta veya şifre hatalı');
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
        throw new Error('E-posta veya şifre hatalı');
    }

    // Remove password_hash from user object
    const { password_hash, ...safeUser } = user;

    // Create token and save to localStorage
    const token = createToken({ userId: safeUser.id, email: safeUser.email });
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(safeUser));

    return { user: safeUser, token };
}

// Logout user
export function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

// Request password reset (placeholder - needs email service)
export async function requestPasswordReset(email) {
    const user = await queryOne(
        `SELECT id FROM users WHERE email = $1`,
        [email.toLowerCase()]
    );

    if (!user) {
        // Don't reveal if user exists or not
        return { success: true, message: 'Eğer bu e-posta kayıtlıysa, şifre sıfırlama bağlantısı gönderildi' };
    }

    // TODO: Implement email sending for password reset
    // For now, just return success
    return { success: true, message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi' };
}

// Get user ID for database queries
export function getUserId() {
    const user = getCurrentUser();
    return user?.id || null;
}

export default {
    register,
    login,
    logout,
    getCurrentUser,
    isAuthenticated,
    requestPasswordReset,
    getUserId
};
