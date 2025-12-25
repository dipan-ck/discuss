import { Context, Next } from "hono";
import { Socket } from "socket.io";

/**
 * Development-only auth middleware
 * Automatically attaches a dummy user to context
 */


export const devAuthMiddleware = async (c: Context, next: Next) => {
  if (process.env.NODE_ENV === "development") {
    c.set("userId", "cmiq743f50000isfplg9iw1lb");
  }
  await next();
}


export const devAuthMiddlewareSocket = (socket: Socket, next: (err?: any) => void) => {
  if (process.env.NODE_ENV === "development") {
    socket.data.userId = "cmiq743f50000isfplg9iw1lb";
}
      next();
}

