import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../i18n/i18n";
import { AuthContext } from "../../../context/AuthContext";
import HackathonRegisterModal from "../HackathonRegisterModal";
import { getPublicIdeas } from "../../../api/ideas";
import { getUsers } from "../../../api/users";
import { registerForHackathon } from "../../../api/registrations";
import toast from "react-hot-toast";

// 🔧 Mocks
vi.mock("../../../api/ideas");
vi.mock("../../../api/users");
vi.mock("../../../api/registrations");
vi.mock("react-hot-toast", () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock child component
vi.mock("../MemberSearchPicker", () => ({
    __esModule: true,
    default: ({ users, selectedIds, onChange }) => (
        <div data-testid="member-picker">
            {users.map((u) => (
                <div
                    key={u._id}
                    data-testid={`user-${u._id}`}
                    onClick={() => onChange([...selectedIds, u._id])}
                >
                    {u.name}
                </div>
            ))}
        </div>
    ),
}));

const mockHackathon = { _id: "hack1", title: "AI Challenge" };

const renderWithProviders = (ui, { token = "mockToken" } = {}) =>
    render(
        <I18nextProvider i18n={i18n}>
            <AuthContext.Provider value={{ token }}>{ui}</AuthContext.Provider>
        </I18nextProvider>
    );

describe("HackathonRegisterModal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("renders form fields and title correctly", async () => {
        getPublicIdeas.mockResolvedValueOnce({ ideas: [{ _id: "idea1", title: "Smart City" }] });
        getUsers.mockResolvedValueOnce({
            groupedUsers: { organizers: [{ _id: "u1", name: "Alice" }] },
        });

        renderWithProviders(
            <HackathonRegisterModal open={true} onClose={vi.fn()} hackathon={mockHackathon} />
        );

        await waitFor(() => expect(getPublicIdeas).toHaveBeenCalled());

        expect(screen.getByText(/AI Challenge/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Team Name/i)).toBeInTheDocument();
        expect(screen.getByTestId("member-picker")).toBeInTheDocument();

        // Open select to reveal options
        const ideaSelect = screen.getByRole("combobox");
        fireEvent.mouseDown(ideaSelect);

        // Check option inside listbox
        const listbox = await screen.findByRole("listbox");
        expect(within(listbox).getByText(/Smart City/i)).toBeInTheDocument();
    });

    test("submits registration successfully", async () => {
        getPublicIdeas.mockResolvedValueOnce({ ideas: [{ _id: "idea1", title: "AI App" }] });
        getUsers.mockResolvedValueOnce({ groupedUsers: { mentors: [{ _id: "u1", name: "Bob" }] } });
        registerForHackathon.mockResolvedValueOnce({ success: true });

        const onClose = vi.fn();
        renderWithProviders(
            <HackathonRegisterModal open={true} onClose={onClose} hackathon={mockHackathon} />
        );

        await waitFor(() => expect(getPublicIdeas).toHaveBeenCalled());

        // Fill team name
        fireEvent.change(screen.getByLabelText(/Team Name/i), { target: { value: "Dream Team" } });

        // Open and select idea
        fireEvent.mouseDown(screen.getByRole("combobox"));
        const listbox = await screen.findByRole("listbox");
        fireEvent.click(within(listbox).getByText(/AI App/i));

        // Select a member
        fireEvent.click(screen.getByTestId("user-u1"));

        // Submit form
        fireEvent.click(screen.getByRole("button", { name: /Register/i }));

        await waitFor(() =>
            expect(registerForHackathon).toHaveBeenCalledWith(
                "hack1",
                { teamName: "Dream Team", ideaId: "idea1", memberIds: ["u1"] },
                "mockToken"
            )
        );

        expect(toast.success).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });

    test("shows error toast if API fails", async () => {
        getPublicIdeas.mockRejectedValueOnce(new Error("fetch failed"));
        getUsers.mockResolvedValueOnce({ groupedUsers: {} });

        renderWithProviders(
            <HackathonRegisterModal open={true} onClose={vi.fn()} hackathon={mockHackathon} />
        );

        await waitFor(() => expect(toast.error).toHaveBeenCalled());
    });

    test("does not fetch data if modal is closed", async () => {
        renderWithProviders(
            <HackathonRegisterModal open={false} onClose={vi.fn()} hackathon={mockHackathon} />
        );
        expect(getPublicIdeas).not.toHaveBeenCalled();
        expect(getUsers).not.toHaveBeenCalled();
    });
});
