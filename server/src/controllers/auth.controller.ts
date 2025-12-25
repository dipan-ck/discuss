import { Context } from "hono";
import { authService } from "../services/auth.service.js";
import { ZodError } from "zod";
import { setCookie, deleteCookie } from "hono/cookie";



export async function signupUser(c: Context) {
    try{

        const { email, username, password } = await c.req.json();

        // Validate signup data
       const parsedData =  await authService.valiodateSignupData({ email, username, password });

        // Check if email is unique
        const existingEmail = await authService.ccheckEmailUnique(parsedData.email);
        if (existingEmail) {
            return c.json({ error: "Email already in use" }, 400);
        }

        // Check if username is unique
        const existingUsername = await authService.checkUsernameUnique(parsedData.username);
        if (existingUsername) {
            return c.json({ error: "Username already taken" }, 400);
        }


        // Hash password
        const hashedPassword = await authService.hashPassword(parsedData.password);
        // Create user
        const newUser = await authService.createUser(
            parsedData.email,
            parsedData.username,
            hashedPassword
        );

        // Generate JWT
        const token = authService.generateToken({
            id: newUser.id,
            email: newUser.email,
            username: newUser.username,
        });

        setCookie(c, "token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        });

        return c.json({message: "User created successfully"}, 201);


    }catch(err){

  if (err instanceof ZodError) {
      return c.json({
        message: err.issues.map((issue) => issue.message).join(", "),
      }, 400);
    }

    console.error(err);
    return c.json({ message: "Internal Server Error" }, 500);

    }
}


export async function loginUser(c: Context) {
    try {
        const { email, password } = await c.req.json();

        // Validate login data
        const parsedData = await authService.validateLoginData({ email, password });

        // Get user by email
        const user = await authService.getUserByEmail(parsedData.email);
        if (!user) {
            return c.json({ error: "Invalid email or password" }, 401);
        }

        // Compare password
        const isPasswordValid = await authService.comparePassword(parsedData.password, user.password);
        if (!isPasswordValid) {
            return c.json({ error: "Invalid email or password" }, 401);
        }

        // Generate JWT
        const token = authService.generateToken({
            id: user.id,
            email: user.email,
            username: user.username,
        });

        setCookie(c, "token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        });

        return c.json({ message: "Login successful" }, 200);

    } catch (err) {
        if (err instanceof ZodError) {
            return c.json({
                message: err.issues.map((issue) => issue.message).join(", "),
            }, 400);
        }

        console.error(err);
        return c.json({ message: "Internal Server Error" }, 500);
    }
}


export async function getUser(c: Context) {
    try {

         const user = c.get("user");

         return c.json({ data: user, message: "User fetched successfully" });

    }catch(error){
        console.error(error);
        return c.json({ message: "Internal Server Error" }, 500);
    }
}


export async function logoutUser(c: Context) {
    try {
        // Delete the token cookie
        deleteCookie(c, "token", {
  path: "/",
  secure: true,
  sameSite: "none",
});


        return c.json({ message: "Logout successful" }, 200);

    } catch (error) {
        console.error(error);
        return c.json({ message: "Internal Server Error" }, 500);
    }
}


export async function deleteAccount(c: Context) {
    try {
        const userId = c.get("userId");

        if (!userId) {
            return c.json({ message: "Unauthorized" }, 401);
        }

        await authService.deleteUser(userId);
        deleteCookie(c, "token");

        return c.json({ message: "Account deleted successfully", success: true });

    } catch (error) {
        console.error(error);
        return c.json({ message: "Internal Server Error" }, 500);
    }
}