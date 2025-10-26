import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../i18n/i18n";
import HackathonForm from "../HackathonForm";

const renderWithI18n = (ui) =>
    render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);

describe("HackathonForm", () => {
    const mockOnSubmit = vi.fn();

    beforeEach(() => {
        mockOnSubmit.mockClear();
    });

    test("creates a hackathon with title, description, and a round", () => {
        renderWithI18n(<HackathonForm onSubmit={mockOnSubmit} />);

        // Fill Hackathon Title
        fireEvent.change(screen.getByLabelText("Hackathon Title"), {
            target: { value: "My Hackathon" },
        });

        // Fill Description (Markdown editor)
        const descriptionTextarea = screen.getByLabelText("Hackathon Description");
        fireEvent.change(descriptionTextarea, {
            target: { value: "This is a test hackathon" },
        });

        // Add Round
        const addRoundButton = screen.getByRole("button", {
            name: /Add Round/i,
        });
        fireEvent.click(addRoundButton);

        // Fill Round Name
        const roundContainer = screen.getAllByTestId("round-container")[0];
        const roundNameInput = within(roundContainer).getByLabelText("Round Name");
        fireEvent.change(roundNameInput, { target: { value: "Round 1" } });

        // Submit
        const submitButton = screen.getByRole("button", { name: /Create/i });
        fireEvent.click(submitButton);

        expect(mockOnSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "My Hackathon",
                description: "This is a test hackathon",
                rounds: [{ name: "Round 1", description: "", startDate: undefined, endDate: undefined, isActive: false }],
            })
        );
    });

    test("edits an existing hackathon correctly", () => {
        const hackathon = {
            title: "Old Hackathon",
            description: "Old description",
            rounds: [{ name: "Old Round", description: "" }],
        };

        renderWithI18n(
            <HackathonForm initialData={hackathon} onSubmit={mockOnSubmit} />
        );

        // Update Hackathon Title
        fireEvent.change(screen.getByLabelText("Hackathon Title"), {
            target: { value: "Updated Hackathon" },
        });

        // Update Description
        const descriptionTextarea = screen.getByLabelText("Hackathon Description");
        fireEvent.change(descriptionTextarea, {
            target: { value: "Updated description" },
        });

        // Update Round Name
        const roundContainer = screen.getAllByTestId("round-container")[0];
        const roundNameInput = within(roundContainer).getByLabelText("Round Name");
        fireEvent.change(roundNameInput, { target: { value: "Updated Round" } });

        // Submit
        const submitButton = screen.getByRole("button", { name: /Update/i });
        fireEvent.click(submitButton);

        expect(mockOnSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Updated Hackathon",
                description: "Updated description",
                rounds: [{ name: "Updated Round", description: "", startDate: undefined, endDate: undefined, isActive: false }],
            })
        );
    });
});
