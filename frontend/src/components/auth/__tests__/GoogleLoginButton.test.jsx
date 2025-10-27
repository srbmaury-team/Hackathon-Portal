import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import GoogleLoginButton from "../GoogleLoginButton";
import * as api from "../../../api/auth";
import toast from "react-hot-toast";
import { AuthContext } from "../../../context/AuthContext";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../i18n/i18n";

// Mock API
vi.mock("../../../api/auth", () => ({
  googleLogin: vi.fn(),
}));

// Mock toast
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock GoogleLogin component
vi.mock("@react-oauth/google", () => ({
  GoogleLogin: ({ onSuccess, onError }) => (
    <button
      onClick={() => onSuccess({ credential: "fake-token" })}
      data-testid="google-login-btn"
    >
      Login with Google
    </button>
  ),
}));

describe("GoogleLoginButton component", () => {
  const loginMock = vi.fn();

  const renderComponent = () =>
    render(
      <I18nextProvider i18n={i18n}>
        <AuthContext.Provider value={{ login: loginMock }}>
          <GoogleLoginButton />
        </AuthContext.Provider>
      </I18nextProvider>
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls login and shows success toast on successful Google login", async () => {
    api.googleLogin.mockResolvedValue({
      user: { name: "Test User" },
      token: "fake-token",
    });

    renderComponent();

    const loginBtn = screen.getByTestId("google-login-btn");
    loginBtn.click();

    await waitFor(() => {
      expect(api.googleLogin).toHaveBeenCalledWith("fake-token");
      expect(loginMock).toHaveBeenCalledWith(
        { name: "Test User" },
        "fake-token"
      );
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it("shows error toast when Google login API fails", async () => {
    api.googleLogin.mockRejectedValue({
      response: { data: { message: "API Error" } },
    });

    renderComponent();

    const loginBtn = screen.getByTestId("google-login-btn");
    loginBtn.click();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("API Error");
    });
  });
});
