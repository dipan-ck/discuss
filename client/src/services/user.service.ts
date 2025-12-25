import api from "@/lib/axios";


export async function getUser(){
    const response = await api.post("/auth/verify-me");
    return response.data;
}

export async function loginUser(email: string, password: string) {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
}

export async function signupUser(email: string, username: string, password: string) {
    const response = await api.post("/auth/signup", { email, username, password });
    return response.data;
}

export async function logoutUser() {
    const response = await api.post("/auth/logout");
    return response.data;
}


export async function deleteAccount() {
    const response = await api.delete("/auth/delete-account");
    return response.data;
}