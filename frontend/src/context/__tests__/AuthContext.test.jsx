import React, { useContext } from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { vi, describe, it, beforeEach, expect } from "vitest";
import { AuthProvider, AuthContext } from "../AuthContext";

// Dummy component to access context
const TestComponent = () => {
  const { user, login, logout } = useContext(AuthContext);

  return (
    <div>
      <span data-testid="user">{user ? user.name : "no-user"}</span>
      <button
        onClick={() => login({ name: "Test User" }, "token123")}
        data-testid="login"
      >
        Login
      </button>
      <button onClick={() => logout()} data-testid="logout">
        Logout
      </button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should have null user initially if no localStorage", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByTestId("user").textContent).toBe("no-user");
  });

  it("should load user from localStorage if present", () => {
    localStorage.setItem("user", JSON.stringify({ name: "Saved User" }));
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByTestId("user").textContent).toBe("Saved User");
  });

  it("login should set user and localStorage", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    act(() => {
      screen.getByTestId("login").click();
    });

    expect(screen.getByTestId("user").textContent).toBe("Test User");
    expect(JSON.parse(localStorage.getItem("user")).name).toBe("Test User");
    expect(localStorage.getItem("token")).toBe("token123");
  });

  it("logout should clear user and localStorage", () => {
    localStorage.setItem("user", JSON.stringify({ name: "Saved User" }));
    localStorage.setItem("token", "token123");

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    act(() => {
      screen.getByTestId("logout").click();
    });

    expect(screen.getByTestId("user").textContent).toBe("no-user");
    expect(localStorage.getItem("user")).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
  });
});
