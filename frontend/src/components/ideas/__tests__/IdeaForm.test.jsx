import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import IdeaForm from "../IdeaForm";
import * as api from "../../../api/ideas";
import toast from "react-hot-toast";

// Mock the API and toast
vi.mock("../../../api/ideas");
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("IdeaForm", () => {
  const token = "dummy-token";
  const onIdeaSubmitted = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders form fields", () => {
    render(<IdeaForm token={token} onIdeaSubmitted={onIdeaSubmitted} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/make idea public/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  test("shows error toast when fields are empty", async () => {
    render(<IdeaForm token={token} onIdeaSubmitted={onIdeaSubmitted} />);

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("All fields are required");
    });

    expect(api.submitIdea).not.toHaveBeenCalled();
  });

  test("submits idea successfully", async () => {
    api.submitIdea.mockResolvedValueOnce({});

    render(<IdeaForm token={token} onIdeaSubmitted={onIdeaSubmitted} />);

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "Test Idea" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Test Description" },
    });

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(api.submitIdea).toHaveBeenCalledWith(
        { title: "Test Idea", description: "Test Description", isPublic: true },
        token
      );
      expect(toast.success).toHaveBeenCalledWith("Idea submitted successfully!");
      expect(onIdeaSubmitted).toHaveBeenCalled();
    });
  });

  test("shows error toast when API fails", async () => {
    api.submitIdea.mockRejectedValueOnce(new Error("API failed"));

    render(<IdeaForm token={token} onIdeaSubmitted={onIdeaSubmitted} />);

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "Test Idea" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Test Description" },
    });

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to submit idea");
    });
  });
});
