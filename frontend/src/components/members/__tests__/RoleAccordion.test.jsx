// components/user/__tests__/RoleAccordion.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import RoleAccordion from "../RoleAccordion";

// Mock UserTable since we only test RoleAccordion here
vi.mock("../UserTable", () => {
  return {
    default: ({ users }) => (
      <div data-testid="user-table">{users.map(u => u.name).join(", ")}</div>
    ),
  };
});

describe("RoleAccordion", () => {
  const t = (key) => key; // simple translation mock
  const roleColors = {
    admin: "primary",
    participant: "default",
    organizer: "secondary",
    judge: "success",
    mentor: "warning",
  };

  const currentUser = { id: "1", role: "admin" };
  const onChangeRoleClick = vi.fn();

  const users = [
    { _id: "1", name: "Alice", role: "participant" },
    { _id: "2", name: "Bob", role: "participant" },
  ];

  test("renders accordion with role, icon, and user count", () => {
    render(
      <RoleAccordion
        roleKey="participant"
        users={users}
        roleColors={roleColors}
        t={t}
        onChangeRoleClick={onChangeRoleClick}
        currentUser={currentUser}
      />
    );

    expect(screen.getByText("roles.participant")).toBeInTheDocument();
    expect(screen.getByText(users.length.toString())).toBeInTheDocument();
    expect(screen.getByTestId("user-table")).toHaveTextContent("Alice, Bob");
  });

  test("accordion expands and collapses", () => {
    render(
      <RoleAccordion
        roleKey="participant"
        users={users}
        roleColors={roleColors}
        t={t}
        onChangeRoleClick={onChangeRoleClick}
        currentUser={currentUser}
      />
    );

    const summary = screen.getByText("roles.participant").closest("div");
    expect(summary).toBeInTheDocument();

    // Fire click to expand/collapse
    fireEvent.click(summary);
    // UserTable should still be in the document
    expect(screen.getByTestId("user-table")).toBeInTheDocument();
  });

  test("renders different roles correctly", () => {
    render(
      <RoleAccordion
        roleKey="admin"
        users={[{ _id: "1", name: "Admin User", role: "admin" }]}
        roleColors={roleColors}
        t={t}
        onChangeRoleClick={onChangeRoleClick}
        currentUser={currentUser}
      />
    );

    expect(screen.getByText("roles.admin")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByTestId("user-table")).toHaveTextContent("Admin User");
  });
});
