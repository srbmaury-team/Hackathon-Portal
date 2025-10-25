import React, { useContext } from "react";
import { render, screen, act } from "@testing-library/react";
import { vi, describe, it, beforeEach, expect } from "vitest";
import { SettingsProvider, SettingsContext } from "../SettingsContext";
import i18n from "../../i18n/i18n";

// Mock i18n **before** importing context
vi.mock("../../i18n/i18n", () => ({
  default: {
    changeLanguage: vi.fn(),
    language: "en",
  },
}));

// Dummy component to consume context
const TestComponent = () => {
    const { theme, setTheme, language, setLanguage } = useContext(SettingsContext);
    return (
        <div>
            <span data-testid="theme">{theme}</span>
            <span data-testid="language">{language}</span>
            <button onClick={() => setTheme("dark")} data-testid="set-dark">Dark</button>
            <button onClick={() => setTheme("light")} data-testid="set-light">Light</button>
            <button onClick={() => setLanguage("hi")} data-testid="set-hi">HI</button>
        </div>
    );
};

describe("SettingsProvider", () => {
    beforeEach(() => {
        window.matchMedia = vi.fn().mockImplementation((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        }));
        localStorage.clear();
        vi.clearAllMocks();
    });

    it("uses defaults if no localStorage", () => {
        render(
            <SettingsProvider>
                <TestComponent />
            </SettingsProvider>
        );

        expect(screen.getByTestId("theme").textContent).toBe("light");
        expect(screen.getByTestId("language").textContent).toBe("en");
    });

    it("loads saved settings from localStorage", () => {
        localStorage.setItem("theme", "dark");
        localStorage.setItem("language", "hi");

        render(
            <SettingsProvider>
                <TestComponent />
            </SettingsProvider>
        );

        expect(screen.getByTestId("theme").textContent).toBe("dark");
        expect(screen.getByTestId("language").textContent).toBe("hi");
    });

    it("updates theme and saves to localStorage", () => {
        render(
            <SettingsProvider>
                <TestComponent />
            </SettingsProvider>
        );

        act(() => screen.getByTestId("set-dark").click());
        expect(screen.getByTestId("theme").textContent).toBe("dark");
        expect(localStorage.getItem("theme")).toBe("dark");

        act(() => screen.getByTestId("set-light").click());
        expect(screen.getByTestId("theme").textContent).toBe("light");
        expect(localStorage.getItem("theme")).toBe("light");
    });

    it("updates language, saves to localStorage, and calls i18n.changeLanguage", () => {
        render(
            <SettingsProvider>
                <TestComponent />
            </SettingsProvider>
        );

        act(() => screen.getByTestId("set-hi").click());

        expect(screen.getByTestId("language").textContent).toBe("hi");
        expect(localStorage.getItem("language")).toBe("hi");

        expect(i18n.changeLanguage).toHaveBeenCalledWith("hi");
    });
});
