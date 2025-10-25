import React, { useContext, useState } from "react";
import { Typography } from "@mui/material";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useTranslation } from "react-i18next";
import AnnouncementList from "../components/announcements/AnnouncementList";
import AnnouncementCreate from "../components/announcements/AnnouncementCreate";
import { AuthContext } from "../context/AuthContext";

const AnnouncementsPage = () => {
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);
    const [refresh, setRefresh] = useState(false);

    return (
        <DashboardLayout>
            <Typography variant="h4" gutterBottom>
                {t("announcement.announcements")}
            </Typography>

            {(user.role === "admin" || user.role === "organizer") && (
                <AnnouncementCreate onCreated={() => setRefresh(!refresh)} />
            )}

            <AnnouncementList key={refresh} />
        </DashboardLayout>
    );
};

export default AnnouncementsPage;
