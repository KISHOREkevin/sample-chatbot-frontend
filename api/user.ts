import api from "@/config/axios";
import { ILoginUser, IRegisterUser, IOtpVerify, IUserResponse, IForgotPasswordRequest, IResetPasswordRequest } from "@/types/user";

export async function registerUser(data: IRegisterUser): Promise<IUserResponse> {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    if (data.full_name) {
        formData.append("full_name", data.full_name);
    }
    if (data.avatar) {
        formData.append("avatar", data.avatar);
    }

    const response = await api.post<IUserResponse>("/users", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
}

export async function loginUser(data: ILoginUser): Promise<IUserResponse> {
    const response = await api.post<IUserResponse>("/users/login", data);
    return response.data;
}

export async function otpVerify(data: IOtpVerify): Promise<IUserResponse> {
    const response = await api.post<IUserResponse>("/users/verify-otp", data);
    return response.data;
}

export async function forgotPassword(data: IForgotPasswordRequest): Promise<{ message: string; otp_created_at?: string }> {
    const response = await api.post<{ message: string; otp_created_at?: string }>("/users/forgot-password", data);
    return response.data;
}

export async function verifyResetOtp(data: IOtpVerify): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>("/users/verify-reset-otp", data);
    return response.data;
}

export async function resetPassword(data: IResetPasswordRequest): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>("/users/reset-password", data);
    return response.data;
}

export async function resendRegistrationOtp(data: IForgotPasswordRequest): Promise<{ message: string; otp_created_at?: string }> {
    const response = await api.post<{ message: string; otp_created_at?: string }>("/users/resend-registration-otp", data);
    return response.data;
}