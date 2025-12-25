import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import  { z } from "zod";
import prisma from "../lib/prisma";




class AuthService {
    
    private JWT_SECRET: string;
    private JWT_EXPIRES_IN: string;
    private BCRYPT_SALT_ROUNDS: number = 10;


    private signupSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }).max(20, { message: "Username must be between 3 and 20 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(100, { message: "Password must be at most 100 characters" }),
    })

    private loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
    })

    constructor(jwtSecret : string, jwtExpiresIn: string) {
        this.JWT_SECRET = jwtSecret;
        this.JWT_EXPIRES_IN = jwtExpiresIn;
    }


    generateToken(payload: object) : string {
        return jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN as any });
    }


    verifyToken(token: string) {
        return jwt.verify(token, this.JWT_SECRET);
    }

    async hashPassword(password: string) {
        const salt = await bcrypt.genSalt(this.BCRYPT_SALT_ROUNDS);
        return await bcrypt.hash(password, salt);
    }

    async comparePassword(password: string, hashedPassword: string) {
        return await bcrypt.compare(password, hashedPassword);
    }


    async valiodateSignupData(data: any) {
        return this.signupSchema.parse(data);
    }

    async validateLoginData(data: any) {
        return this.loginSchema.parse(data);
    }

    async ccheckEmailUnique(email: string){
        return await prisma.user.findUnique({
            where: { email },
        })
    }

    async checkUsernameUnique(username: string){
        return await prisma.user.findUnique({
            where: { username },
        })
    }


    async createUser(email: string, username: string, hashedPassword: string) {
        return await prisma.user.create({
               data: {
                email,
                username,
                password: hashedPassword,
            }
        }
         
        )
    }

    async getUserById(id: string) {
        return await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                username: true,
            }
        })
    }

    async getUserByEmail(email: string) {
        return await prisma.user.findUnique({
            where: { email },
        })
    }

    async deleteUser(userId: string) {
        return await prisma.user.delete({
            where: { id: userId }
        });
    }

}



export const authService = new AuthService( process.env.JWT_SECRET!, process.env.JWT_EXPIRES_IN!);