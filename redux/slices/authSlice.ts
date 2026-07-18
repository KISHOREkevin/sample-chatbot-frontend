import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { registerUser, loginUser, otpVerify, forgotPassword, verifyResetOtp, resetPassword, resendRegistrationOtp } from "@/api/user";
import { ILoginUser, IRegisterUser, IOtpVerify, IUserResponse, IForgotPasswordRequest, IResetPasswordRequest } from "@/types/user";
import { setCookie, getCookie, deleteCookie } from "@/utils/cookies";

export interface AuthState {
  user: IUserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  planId: string;
  isInitialized: boolean;
}

const getInitialState = (): AuthState => {
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    status: "idle",
    error: null,
    planId: "free",
    isInitialized: false,
  };
};

// Helper to extract clean error message from Axios errors
const getCleanErrorMessage = (error: any): string => {
  if (error.response?.data?.detail) {
    if (typeof error.response.data.detail === "string") {
      return error.response.data.detail;
    }
    if (Array.isArray(error.response.data.detail)) {
      return error.response.data.detail.map((err: any) => err.msg || JSON.stringify(err)).join(", ");
    }
  }
  return error.message || "An unexpected error occurred.";
};

// Async Thunks
export const registerUserThunk = createAsyncThunk(
  "auth/registerUser",
  async (data: IRegisterUser, { rejectWithValue }) => {
    try {
      const response = await registerUser(data);
      return response;
    } catch (err: any) {
      return rejectWithValue(getCleanErrorMessage(err));
    }
  }
);

export const loginUserThunk = createAsyncThunk(
  "auth/loginUser",
  async (data: ILoginUser, { rejectWithValue }) => {
    try {
      const response = await loginUser(data);
      if (response.token) {
        setCookie("token", response.token, 7);
        localStorage.setItem("user", JSON.stringify(response));
      }
      return response;
    } catch (err: any) {
      if (err.response?.data?.detail) {
        return rejectWithValue(err.response.data.detail);
      }
      return rejectWithValue(getCleanErrorMessage(err));
    }
  }
);

export const otpVerifyThunk = createAsyncThunk(
  "auth/otpVerify",
  async (data: IOtpVerify, { rejectWithValue }) => {
    try {
      const response = await otpVerify(data);
      if (response.token) {
        setCookie("token", response.token, 7);
        localStorage.setItem("user", JSON.stringify(response));
      }
      return response;
    } catch (err: any) {
      return rejectWithValue(getCleanErrorMessage(err));
    }
  }
);

export const forgotPasswordThunk = createAsyncThunk(
  "auth/forgotPassword",
  async (data: IForgotPasswordRequest, { rejectWithValue }) => {
    try {
      const response = await forgotPassword(data);
      return response;
    } catch (err: any) {
      return rejectWithValue(getCleanErrorMessage(err));
    }
  }
);

export const verifyResetOtpThunk = createAsyncThunk(
  "auth/verifyResetOtp",
  async (data: IOtpVerify, { rejectWithValue }) => {
    try {
      const response = await verifyResetOtp(data);
      return response;
    } catch (err: any) {
      return rejectWithValue(getCleanErrorMessage(err));
    }
  }
);

export const resetPasswordThunk = createAsyncThunk(
  "auth/resetPassword",
  async (data: IResetPasswordRequest, { rejectWithValue }) => {
    try {
      const response = await resetPassword(data);
      return response;
    } catch (err: any) {
      return rejectWithValue(getCleanErrorMessage(err));
    }
  }
);

export const resendRegistrationOtpThunk = createAsyncThunk(
  "auth/resendRegistrationOtp",
  async (data: IForgotPasswordRequest, { rejectWithValue }) => {
    try {
      const response = await resendRegistrationOtp(data);
      return response;
    } catch (err: any) {
      return rejectWithValue(getCleanErrorMessage(err));
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    initializeAuth: (state) => {
      if (typeof window === "undefined") return;
      const token = getCookie("token");
      state.token = token;
      state.isAuthenticated = !!token;
      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          state.user = parsedUser;
          if (parsedUser.plan_id) {
            state.planId = parsedUser.plan_id;
          }
        }
        const savedPlanId = localStorage.getItem("subscription_plan_id");
        if (savedPlanId) {
          state.planId = savedPlanId;
        }
      } catch (e) {
        console.error("Failed to parse user details from localStorage:", e);
      }
      state.isInitialized = true;
    },
    logoutUser: (state) => {
      deleteCookie("token");
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("subscription_plan_id");
      }
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.status = "idle";
      state.error = null;
      state.planId = "free";
      state.isInitialized = true;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    setAuthStatus: (state, action: PayloadAction<"idle" | "loading" | "succeeded" | "failed">) => {
      state.status = action.payload;
    },
    changeSubscriptionPlan: (state, action: PayloadAction<string>) => {
      state.planId = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("subscription_plan_id", action.payload);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUserThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUserThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        if (action.payload.plan_id) {
          state.planId = action.payload.plan_id;
          localStorage.setItem("subscription_plan_id", action.payload.plan_id);
        }
      })
      .addCase(registerUserThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Login
      .addCase(loginUserThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.token = action.payload.token || null;
        state.isAuthenticated = !!action.payload.token;
        if (action.payload.plan_id) {
          state.planId = action.payload.plan_id;
          localStorage.setItem("subscription_plan_id", action.payload.plan_id);
        }
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.status = "failed";
        if (action.payload && typeof action.payload === "object") {
          state.error = (action.payload as any).error || "An error occurred";
        } else {
          state.error = action.payload as string;
        }
      })
      // OTP Verification
      .addCase(otpVerifyThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(otpVerifyThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.token = action.payload.token || null;
        state.isAuthenticated = !!action.payload.token;
        if (action.payload.plan_id) {
          state.planId = action.payload.plan_id;
          localStorage.setItem("subscription_plan_id", action.payload.plan_id);
        }
      })
      .addCase(otpVerifyThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { initializeAuth, logoutUser, clearAuthError, setAuthStatus, changeSubscriptionPlan } = authSlice.actions;
export default authSlice.reducer;
