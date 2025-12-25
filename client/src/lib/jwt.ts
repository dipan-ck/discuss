import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY: string = process.env.JWT_EXPIRY || "1h";



export function generateToken(payload: object) {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}




export function verifyToken(token: string) {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.verify(token, JWT_SECRET);
}
