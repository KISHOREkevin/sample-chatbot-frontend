export interface IRegisterUser {
    email: string,
    full_name: string,
    password: string,
    avatar: File | null,
}

export interface ILoginUser {
    email: string,
    password: string,
}

export interface IOtpVerify {
    email: string,
    otp_code: string,
}

export interface IUserResponse {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    otp_code?: string | null;
    otp_created_at?: string | null;
    token?: string;
    created_at: string;
    updated_at: string;
}

export interface IForgotPasswordRequest {
    email: string;
}

export interface IResetPasswordRequest {
    email: string;
    otp_code: string;
    new_password: string;
}