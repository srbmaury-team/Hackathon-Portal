import { useState } from "react";
import { Button, TextField, Box, Typography } from "@mui/material";
import MdEditor from "react-markdown-editor-lite";
import MarkdownIt from "markdown-it";
import { useTranslation } from "react-i18next";
import "react-markdown-editor-lite/lib/index.css";
import { createAnnouncement } from "../../api/api";
import toast from "react-hot-toast";

const mdParser = new MarkdownIt();

const AnnouncementCreate = ({ onCreated }) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const token = localStorage.getItem("token");

    const handleSubmit = async () => {
        if (!title || !message) {
            toast.error(t("announcement.all_fields_required"));
            return;
        }

        try {
            const response = await createAnnouncement({ title, message }, token);
            toast.success(response.message || t("announcement.announcement_created"));
            setTitle("");
            setMessage("");
            if (onCreated) onCreated(); // Refresh list
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.message || t("announcement.creation_failed");
            toast.error(errorMsg);
        }
    };

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h6">{t("announcement.create_announcement")}</Typography>
            <TextField
                label={t("announcement.title")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
            />
            <MdEditor
                style={{ height: "300px" }}
                renderHTML={(text) => mdParser.render(text)}
                value={message}
                onChange={({ text }) => setMessage(text)}
            />
            <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={handleSubmit}
            >
                {t("announcement.create")}
            </Button>
        </Box>
    );
};

export default AnnouncementCreate;
