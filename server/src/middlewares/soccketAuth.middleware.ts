import { authService } from "../services/auth.service";
import cookie from "cookie";
import { Socket } from "socket.io";



export function authSocket(socket: Socket, next: (err?: Error) => void) {
  try {
    const cookieHeader = socket.request.headers.cookie;
    if (!cookieHeader) return next(new Error("Unauthorized"));

    const cookies = cookie.parse(cookieHeader);
    const token = cookies.token;

    if (!token) return next(new Error("Unauthorized"));

    const decoded = authService.verifyToken(token);
    if (!decoded) return next(new Error("Unauthorized"));

    // Attach user to socket
    // @ts-ignore
    socket.user = decoded;

    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
}