// src/components/teams/__tests__/MemberSearchPicker.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import MemberSearchPicker from "../MemberSearchPicker";
import "@testing-library/jest-dom";
import { vi } from "vitest";

let originalError;

beforeAll(() => {
    originalError = console.error;
    vi.spyOn(console, "error").mockImplementation((msg, ...args) => {
        if (typeof msg === "string" && msg.includes("Received `true` for a non-boolean attribute `button`")) return;
        originalError(msg, ...args);
    });
});

afterAll(() => {
    console.error.mockRestore();
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

const users = [
    { _id: "1", name: "Bob", email: "bob@example.com" },
    { _id: "2", name: "Alice", email: "alice@example.com" },
    { _id: "3", name: "Charlie", email: "charlie@example.com" },
];

describe("MemberSearchPicker", () => {
    test("renders search input and no list initially", () => {
        render(<MemberSearchPicker users={users} selectedIds={[]} onChange={() => { }} />);
        // there may be multiple inputs due to MUI internals / strict mode; take first
        const [searchInput] = screen.getAllByPlaceholderText(/search members/i);
        expect(searchInput).toBeInTheDocument();
        expect(screen.queryByText("Bob")).not.toBeInTheDocument();
    });

    test("filters users by search query using trie", async () => {
        render(<MemberSearchPicker users={users} selectedIds={[]} onChange={() => { }} />);
        const [searchInput] = screen.getAllByPlaceholderText(/search members/i);
        fireEvent.change(searchInput, { target: { value: "bo" } });

        await waitFor(() => expect(screen.getByText("Bob")).toBeInTheDocument());
        expect(screen.queryByText("Alice")).not.toBeInTheDocument();
    });

    test("selects and deselects a user (controlled component behavior)", async () => {
        const handleChange = vi.fn();

        const { rerender } = render(
            <MemberSearchPicker users={users} selectedIds={["2"]} onChange={handleChange} />
        );

        // Search for Bob
        const [searchInput] = screen.getAllByPlaceholderText(/search members/i);
        fireEvent.change(searchInput, { target: { value: "Bob" } });

        // Wait for Bob to appear in list (there may be multiple "Bob"s: chip + list)
        const [bobItem] = await screen.findAllByText("Bob", { exact: true });

        // Select Bob
        fireEvent.click(bobItem);
        await waitFor(() => {
            expect(handleChange).toHaveBeenCalledTimes(1);
            expect(handleChange).toHaveBeenCalledWith(expect.arrayContaining(["2", "1"]));
        });

        // Simulate parent updating selectedIds
        rerender(<MemberSearchPicker users={users} selectedIds={["2", "1"]} onChange={handleChange} />);

        // Click Bob again (list item, not chip)
        const [bobListItem] = await screen.findAllByText("Bob", { exact: true });
        fireEvent.click(bobListItem);

        await waitFor(() => {
            expect(handleChange).toHaveBeenCalledTimes(2);
            const lastCall = handleChange.mock.calls.at(-1)[0];
            expect(lastCall).toEqual(["2"]);
        });
    });


    test("renders selected users as chips", async () => {
        render(<MemberSearchPicker users={users} selectedIds={["1", "3"]} onChange={() => { }} />);
        // chips are rendered from selectedIds prop immediately
        await waitFor(() => {
            expect(screen.getByText("Bob")).toBeInTheDocument();
            expect(screen.getByText("Charlie")).toBeInTheDocument();
        });
    });
});
