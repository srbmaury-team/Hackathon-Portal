import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import { AuthContext } from "../context/AuthContext";
import IdeaSubmissionPage from "../pages/IdeaSubmissionPage";
import PublicIdeasPage from "../pages/PublicIdeasPage";
import AnnouncementsPage from "../pages/AnnouncementsPage";
import SettingsPage from "../pages/SettingsPage";

const AppRoutes = () => {
    const { user } = useContext(AuthContext);

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        user ? <Navigate to="/announcements" /> : <LoginPage />
                    }
                />
                <Route
                    path="/announcements"
                    element={user ? <AnnouncementsPage /> : <Navigate to="/" />}
                />
                <Route
                    path="/ideas"
                    element={
                        user ? <IdeaSubmissionPage /> : <Navigate to="/" />
                    }
                />
                <Route
                    path="/public-ideas"
                    element={
                        user ? <PublicIdeasPage /> : <Navigate to="/" />
                    }
                />
                <Route
                    path="/settings"
                    element={
                        user ? <SettingsPage /> : <Navigate to="/" />
                    }
                />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;
