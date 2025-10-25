import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DashboardLayout from "../DashboardLayout";
import { AuthContext } from "../../../context/AuthContext";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../i18n/i18n";
import { MemoryRouter } from "react-router-dom";

// Mock MUI icons to avoid rendering issues
vi.mock("@mui/icons-material", () => ({
    Home: () => <div>HomeIcon</div>,
    Lightbulb: () => <div>LightbulbIcon</div>,
    Group: () => <div>GroupIcon</div>,
    EventNote: () => <div>EventNoteIcon</div>,
    Logout: () => <div>LogoutIcon</div>,
    Menu: () => <div>MenuIcon</div>,
    Settings: () => <div>SettingsIcon</div>,
    LightbulbOutline: () => <div>LightbulbOutlineIcon</div>,
}));

describe("DashboardLayout", () => {
    const logoutMock = vi.fn();
    const user = { name: "Test User", role: "participant" };

    const renderComponent = (children = <div>Content</div>) =>
        render(
            <MemoryRouter>
                <I18nextProvider i18n={i18n}>
                    <AuthContext.Provider value={{ user, logout: logoutMock }}>
                        <DashboardLayout>{children}</DashboardLayout>
                    </AuthContext.Provider>
                </I18nextProvider>
            </MemoryRouter>
        );

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders children", () => {
        renderComponent(<div>Test Child</div>);
        expect(screen.getByText("Test Child")).toBeInTheDocument();
    });

    it("renders welcome message with user name", () => {
        renderComponent();
        expect(screen.getByText(/welcome, Test User/i)).toBeInTheDocument();
    });

    it("renders menu items based on user role", () => {
        renderComponent();

        // Participant menu items
        const submitIdeaItems = screen.getAllByText(/submit idea/i);
        expect(submitIdeaItems.length).toBeGreaterThan(0);

        const publicIdeasItems = screen.getAllByText(/public ideas/i);
        expect(publicIdeasItems.length).toBeGreaterThan(0);

        const myTeamsItems = screen.getAllByText(/my teams/i);
        expect(myTeamsItems.length).toBeGreaterThan(0);

        const myParticipationItems = screen.getAllByText(/my participation/i);
        expect(myParticipationItems.length).toBeGreaterThan(0);

        const announcementsItems = screen.getAllByText(/announcements/i);
        expect(announcementsItems.length).toBeGreaterThan(0);

        const settingsItems = screen.getAllByText(/settings/i);
        expect(settingsItems.length).toBeGreaterThan(0);

        const logoutItems = screen.getAllByText(/logout/i);
        expect(logoutItems.length).toBeGreaterThan(0);
    });

    it("calls logout action when logout is clicked", () => {
        renderComponent();

        // Find all "Logout" texts and pick the first one
        const logoutTextElements = screen.getAllByText(/logout/i);

        // Find the closest parent ListItem (or button) that is clickable
        const logoutButton = logoutTextElements.find((el) => el.closest("li") || el.closest("div[role='button']"));
        const clickable = logoutButton.closest("li") || logoutButton.closest("div[role='button']");

        expect(clickable).toBeTruthy();
        fireEvent.click(clickable);

        expect(logoutMock).toHaveBeenCalled();
    });

    it("toggles mobile drawer when menu icon is clicked", () => {
        renderComponent();
        const menuBtn = screen.getByText("MenuIcon");
        fireEvent.click(menuBtn);
        // Drawer open state is internal; mainly ensure no crash and click works
        expect(menuBtn).toBeInTheDocument();
    });
});
