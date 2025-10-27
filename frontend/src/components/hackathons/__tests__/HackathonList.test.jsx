import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import HackathonList from "../HackathonList";

// Correct mock for Vitest with default export
vi.mock("../HackathonItem", () => {
    return {
        default: ({ hackathon, onEdit, onDelete }) => (
            <div data-testid="hackathon-item">
                <span>{hackathon.title}</span>
                <button onClick={() => onEdit(hackathon)}>Edit</button>
                <button onClick={() => onDelete(hackathon._id)}>Delete</button>
            </div>
        ),
    };
});

describe("HackathonList", () => {
    const hackathons = [
        { _id: "1", title: "Hackathon 1" },
        { _id: "2", title: "Hackathon 2" },
    ];

    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("renders the correct number of HackathonItem components", () => {
        render(<HackathonList hackathons={hackathons} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

        const items = screen.getAllByTestId("hackathon-item");
        expect(items).toHaveLength(2);

        expect(screen.getByText("Hackathon 1")).toBeInTheDocument();
        expect(screen.getByText("Hackathon 2")).toBeInTheDocument();
    });

    test("calls onEdit when an item's Edit button is clicked", () => {
        render(<HackathonList hackathons={hackathons} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

        fireEvent.click(screen.getAllByText("Edit")[0]);
        expect(mockOnEdit).toHaveBeenCalledWith(hackathons[0]);
    });

    test("calls onDelete when an item's Delete button is clicked", () => {
        render(<HackathonList hackathons={hackathons} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

        fireEvent.click(screen.getAllByText("Delete")[1]);
        expect(mockOnDelete).toHaveBeenCalledWith(hackathons[1]._id);
    });
});
