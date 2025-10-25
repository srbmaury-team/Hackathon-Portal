import { useEffect, useState, useRef, useContext } from "react";
import AnnouncementItem from "./AnnouncementItem";
import { Typography, CircularProgress, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { getAnnouncements } from "../../api/api";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";

const AnnouncementList = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);
    const token = localStorage.getItem("token");
    const effectRan = useRef(false);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await getAnnouncements(token);
            setAnnouncements(res.announcements || []);
        } catch (err) {
            const errorMsg = err.response?.data?.message || t("announcement.get_failed");
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (effectRan.current) return;
        effectRan.current = true;
        fetchAnnouncements();
    }, [token, t]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    if (!announcements.length) {
        return <Typography>{t("announcement.no_announcements")}</Typography>;
    }

    return (
        <>
            {announcements.map((announcement) => (
                <AnnouncementItem
                    key={announcement._id}
                    announcement={announcement}
                    user={user}
                    onUpdated={fetchAnnouncements}
                    onDeleted={fetchAnnouncements}
                />
            ))}
        </>
    );
};

export default AnnouncementList;
