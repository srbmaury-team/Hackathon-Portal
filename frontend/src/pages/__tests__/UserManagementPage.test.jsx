import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import UserManagementPage from "../UserManagementPage";
import { AuthContext } from "../../context/AuthContext";
import * as api from "../../api/api";
import toast from "react-hot-toast";

vi.mock("../../api/api");
// Mock react-hot-toast
vi.mock("react-hot-toast", () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const renderWithProviders = (ui, { user } = {}) => {
    return render(
        <MemoryRouter>
            <AuthContext.Provider value={{ user }}>
                {ui}
            </AuthContext.Provider>
        </MemoryRouter>
    );
};

describe("UserManagementPage", () => {
    const token = "fake-token";
    const adminUser = { role: "admin" };
    const usersResponse = {
        groupedUsers: {
            organizer: [{ _id: "1", name: "Bob", email: "bob@test.com", role: "organizer" }],
            participant: [{ _id: "2", name: "Alice", email: "alice@test.com", role: "participant" }],
        },
    };

    beforeEach(() => {
        localStorage.setItem("token", token);
        vi.clearAllMocks();
    });

    test("renders loading initially and fetches users", async () => {
        api.getUsers.mockResolvedValueOnce(usersResponse);

        renderWithProviders(<UserManagementPage />, { user: adminUser });

        expect(screen.getByRole("progressbar")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText("Bob")).toBeInTheDocument();
            expect(screen.getByText("Alice")).toBeInTheDocument();
        });
    });

    test("filters users based on search input", async () => {
        api.getUsers.mockResolvedValueOnce(usersResponse);

        renderWithProviders(<UserManagementPage />, { user: adminUser });

        await screen.findByText("Bob");

        const searchInput = screen.getByPlaceholderText(/search for a user/i);
        fireEvent.change(searchInput, { target: { value: "alice" } });

        expect(screen.queryByText("Bob")).not.toBeInTheDocument();
        expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    test("opens change role dialog and updates role successfully", async () => {
        api.getUsers.mockResolvedValueOnce(usersResponse);
        api.updateUserRole.mockResolvedValueOnce({});

        renderWithProviders(<UserManagementPage />, { user: adminUser });

        const changeRoleButton = await screen.findByRole("button", { name: /Change Role/i });
        fireEvent.click(changeRoleButton);

        // Find the combobox in the dialog
        const dialog = screen.getByRole("dialog", { name: /Change Role for Bob/i });
        const select = within(dialog).getByRole("combobox");

        // Open options
        fireEvent.mouseDown(select);

        // Choose "participant"
        const option = await screen.findByRole("option", { name: /participant/i });
        fireEvent.click(option);

        // Click update
        const updateButton = within(dialog).getByRole("button", { name: /update/i });
        fireEvent.click(updateButton);

        await waitFor(() => {
            expect(api.updateUserRole).toHaveBeenCalledWith("1", "participant", token);
            expect(toast.success).toHaveBeenCalled();
        });
    });

    test("shows error toast if fetching users fails", async () => {
        api.getUsers.mockRejectedValueOnce(new Error("API failed"));

        renderWithProviders(<UserManagementPage />, { user: adminUser });

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(expect.any(String));
        });
    });
});
