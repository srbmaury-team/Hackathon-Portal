// components/__tests__/MarkdownViewer.test.jsx

import React from "react";
import { render, screen } from "@testing-library/react";
import MarkdownViewer from "../MarkdownViewer";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Mock @uiw/react-md-editor
import MDEditor from "@uiw/react-md-editor";
vi.mock(
    "@uiw/react-md-editor",
    async (importOriginal) => {
        const actual = await importOriginal();
        return {
            ...actual,
            default: {
                ...actual.default,
                Markdown: ({ source }) => <div data-testid="md-content">{source}</div>,
            },
        };
    }
);

const renderWithTheme = (ui, mode = "light") => {
    const theme = createTheme({ palette: { mode } });
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe("MarkdownViewer", () => {
    it("renders markdown content", () => {
        const content = "# Heading\nSome **bold** text";
        renderWithTheme(<MarkdownViewer content={content} />);

        const mdDiv = screen.getByTestId("md-content");
        expect(mdDiv).toBeInTheDocument();
        expect(mdDiv).toHaveTextContent("Heading");
        expect(mdDiv).toHaveTextContent("Some **bold** text");
    });

    it("applies light color scheme by default", () => {
        const content = "Light mode text";
        const { container } = renderWithTheme(<MarkdownViewer content={content} />);
        const wrapper = container.firstChild;

        expect(wrapper).toHaveAttribute("data-color-mode", "light");
    });

    it("applies dark color scheme when specified", () => {
        const content = "Dark mode text";
        const { container } = renderWithTheme(
            <MarkdownViewer content={content} colorScheme="dark" />,
            "dark"
        );
        const wrapper = container.firstChild;

        expect(wrapper).toHaveAttribute("data-color-mode", "dark");
    });

    it("renders images correctly", () => {
        const content = "![alt text](https://example.com/image.png)";
        renderWithTheme(<MarkdownViewer content={content} />);

        const mdDiv = screen.getByTestId("md-content");
        expect(mdDiv).toHaveTextContent("![alt text](https://example.com/image.png)");
    });

    it("renders links correctly", () => {
        const content = "[Google](https://google.com)";
        renderWithTheme(<MarkdownViewer content={content} />);

        const mdDiv = screen.getByTestId("md-content");
        expect(mdDiv).toHaveTextContent("[Google](https://google.com)");
    });

    it("renders blockquotes correctly", () => {
        const content = "> This is a quote";
        renderWithTheme(<MarkdownViewer content={content} />);

        const mdDiv = screen.getByTestId("md-content");
        expect(mdDiv).toHaveTextContent("> This is a quote");
    });
});
