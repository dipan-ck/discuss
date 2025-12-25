import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { authService } from "../services/auth.service.js";



export async function authMiddleware(c: Context, next: Next) {
    try {
        const token = getCookie(c, 'token');

        
        
        if (!token) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        // Verify token
        const decoded = authService.verifyToken(token);

        if (!decoded) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        // Attach user info to context
        c.set('userId', (decoded as any).id);
        c.set('user', decoded);

        await next();
    } catch (error) {
        console.log(error);
        return c.json({ error: "Unauthorized" }, 401);
    }
}
