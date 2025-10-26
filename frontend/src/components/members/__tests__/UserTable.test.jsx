// components/user/__tests__/UserTable.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import UserTable from "../UserTable";

describe("UserTable", () => {
    const t = (key) => key; // mock translation
    const roleColors = {
        admin: "primary",
        participant: "default",
        organizer: "secondary",
        judge: "success",
        mentor: "warning",
    };
    const onChangeRoleClick = vi.fn();

    const users = [
        { _id: "1", name: "Alice", email: "alice@test.com", role: "participant", organization: { name: "Org A" } },
        { _id: "2", name: "Bob", email: "bob@test.com", role: "admin", organization: { name: "Org A" } },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("renders table headers and user data", () => {
        render(<UserTable users={users} roleColors={roleColors} onChangeRoleClick={onChangeRoleClick} t={t} currentUser={{ role: "admin" }} />);

        // Headers
        expect(screen.getByText("user_management.name")).toBeInTheDocument();
        expect(screen.getByText("user_management.email")).toBeInTheDocument();
        expect(screen.getByText("user_management.organization")).toBeInTheDocument();
        expect(screen.getByText("user_management.role")).toBeInTheDocument();
        expect(screen.getByText("user_management.actions")).toBeInTheDocument();

        // Users
        const aliceRow = screen.getByText("Alice").closest("tr");
        expect(aliceRow).toHaveTextContent("alice@test.com");
        expect(aliceRow).toHaveTextContent("Org A");
        expect(aliceRow).toHaveTextContent("roles.participant");

        const bobRow = screen.getByText("Bob").closest("tr");
        expect(bobRow).toHaveTextContent("bob@test.com");
        expect(bobRow).toHaveTextContent("Org A");
        expect(bobRow).toHaveTextContent("roles.admin");
    });

    test("renders Change Role button only for non-admin users when currentUser is admin", () => {
        render(<UserTable users={users} roleColors={roleColors} onChangeRoleClick={onChangeRoleClick} t={t} currentUser={{ role: "admin" }} />);

        expect(screen.getByText("user_management.change_role")).toBeInTheDocument(); // Only Alice has button
        const buttons = screen.getAllByRole("button", { name: /user_management.change_role/i });
        expect(buttons).toHaveLength(1);
    });

    test("does not render Change Role button for admin users or participant without permission", () => {
        render(<UserTable users={users} roleColors={roleColors} onChangeRoleClick={onChangeRoleClick} t={t} currentUser={{ role: "participant" }} />);

        const buttons = screen.queryAllByRole("button", { name: /user_management.change_role/i });
        expect(buttons).toHaveLength(0);
    });

    test("calls onChangeRoleClick when button is clicked", () => {
        render(<UserTable users={users} roleColors={roleColors} onChangeRoleClick={onChangeRoleClick} t={t} currentUser={{ role: "admin" }} />);

        const button = screen.getByText("user_management.change_role");
        fireEvent.click(button);

        expect(onChangeRoleClick).toHaveBeenCalledTimes(1);
        expect(onChangeRoleClick).toHaveBeenCalledWith(users[0]);
    });
});
