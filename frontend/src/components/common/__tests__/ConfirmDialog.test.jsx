import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import ConfirmDialog from "../ConfirmDialog";

// Mock react-i18next
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations = {
                "common.confirm_title": "Are you sure?",
                "common.cancel": "Cancel",
                "common.confirm": "Confirm",
            };
            return translations[key] || key;
        },
    }),
}));

const renderWithTheme = (ui, mode = "light") => {
    const theme = createTheme({ palette: { mode } });
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe("ConfirmDialog", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders with default translation texts", () => {
        renderWithTheme(
            <ConfirmDialog open={true} onConfirm={onConfirm} onCancel={onCancel} />
        );

        expect(screen.getByText("Are you sure?")).toBeInTheDocument();
        expect(screen.getByText("Cancel")).toBeInTheDocument();
        expect(screen.getByText("Confirm")).toBeInTheDocument();
    });

    it("renders custom title and message", () => {
        renderWithTheme(
            <ConfirmDialog
                open={true}
                title="Delete Item"
                message="Do you really want to delete this item?"
                onConfirm={onConfirm}
                onCancel={onCancel}
            />
        );

        expect(screen.getByText("Delete Item")).toBeInTheDocument();
        expect(screen.getByText("Do you really want to delete this item?")).toBeInTheDocument();
    });

    it("renders custom button texts", () => {
        renderWithTheme(
            <ConfirmDialog
                open={true}
                confirmText="Yes, Delete"
                cancelText="No, Cancel"
                onConfirm={onConfirm}
                onCancel={onCancel}
            />
        );

        expect(screen.getByText("Yes, Delete")).toBeInTheDocument();
        expect(screen.getByText("No, Cancel")).toBeInTheDocument();
    });

    it("calls onConfirm when confirm button is clicked", () => {
        renderWithTheme(
            <ConfirmDialog open={true} onConfirm={onConfirm} onCancel={onCancel} />
        );

        fireEvent.click(screen.getByText("Confirm"));
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("calls onCancel when cancel button is clicked", () => {
        renderWithTheme(
            <ConfirmDialog open={true} onConfirm={onConfirm} onCancel={onCancel} />
        );

        fireEvent.click(screen.getByText("Cancel"));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("should not render dialog content when open is false", () => {
        renderWithTheme(
            <ConfirmDialog open={false} onConfirm={onConfirm} onCancel={onCancel} />
        );

        expect(screen.queryByText("Are you sure?")).not.toBeInTheDocument();
    });

    it("applies confirm button color correctly", () => {
        renderWithTheme(
            <ConfirmDialog
                open={true}
                onConfirm={onConfirm}
                onCancel={onCancel}
                confirmColor="primary"
            />
        );

    const confirmButton = screen.getByText("Confirm");
    // MUI doesn't always expose the `color` prop as a DOM attribute — assert the contained variant
    // and that a color-related class is present.
    expect(confirmButton.className).toMatch(/MuiButton-contained/);
    expect(confirmButton.className).toMatch(/Primary|primary/i);
    });
});
