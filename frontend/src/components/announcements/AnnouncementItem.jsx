import React, { useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    Divider,
    Box,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs from "dayjs";
import MDEditor from "@uiw/react-md-editor";
import toast from "react-hot-toast";
import { updateAnnouncement, deleteAnnouncement } from "../../api/api";
import { useTranslation } from "react-i18next";

const AnnouncementItem = ({ announcement, user, onUpdated, onDeleted }) => {
    const [editing, setEditing] = useState(false);
    const [editedMessage, setEditedMessage] = useState(announcement.message);
    const [editedTitle, setEditedTitle] = useState(announcement.title);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const token = localStorage.getItem("token");

    const isOrganizer = user.role === "organizer";
    const isAdmin = user.role === "admin";
    const canEdit = isAdmin || (isOrganizer && announcement.createdBy._id === user._id);
    const canDelete = isAdmin || (isOrganizer && announcement.createdBy._id === user._id);
    const { t } = useTranslation();

    // Delete using api.js
    const handleDelete = async () => {

        console.log(announcement.createdBy._id == user._id);
        console.log(user._id);
        try {
            await deleteAnnouncement(announcement._id, token);
            toast.success(t("announcement.announcement_deleted"));
            onDeleted?.();
        } catch (err) {
            toast.error(err.response?.data?.message || t("announcement.delete_failed"));
        } finally {
            setConfirmOpen(false);
        }
    };

    // Update using api.js
    const handleUpdate = async () => {
        try {
            await updateAnnouncement(
                announcement._id,
                { title: editedTitle, message: editedMessage },
                token
            );
            toast.success(t("announcement.announcement_updated"));
            setEditing(false);
            onUpdated?.();
        } catch (err) {
            toast.error(err.response?.data?.message || t("announcement.update_failed"));
        }
    };

    if (editing) {
        return (
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        {t("announcement.edit_announcement")}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">{t("announcement.title")}</Typography>
                        <input
                            type="text"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                        />
                    </Box>
                    <MDEditor value={editedMessage} onChange={setEditedMessage} height={200} />
                    <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                        <Button variant="contained" color="primary" onClick={handleUpdate}>
                            {t("announcement.update")}
                        </Button>
                        <Button variant="outlined" onClick={() => setEditing(false)}>
                            {t("announcement.cancel")}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
                {/* Title bar */}
                <Box
                    sx={{
                        backgroundColor: "primary.main",
                        color: "primary.contrastText",
                        px: 2,
                        py: 1.5,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {announcement.title}
                    </Typography>
                    <Box>

                        {canEdit && (
                            <IconButton aria-label="edit" size="small" sx={{ color: "white" }} onClick={() => setEditing(true)}>
                                <EditIcon />
                            </IconButton>
                        )}
                        {canDelete && (
                            <IconButton aria-label="delete" size="small" sx={{ color: "white" }} onClick={() => setConfirmOpen(true)}>
                                <DeleteIcon />
                            </IconButton>
                        )}
                    </Box>
                </Box>

                <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5, fontSize: "0.875rem", color: "text.secondary" }}>
                        <span>Posted by {announcement.createdBy?.name || "Unknown"}</span>
                        <span>{dayjs(announcement.createdAt).format("DD MMM YYYY, h:mm A")}</span>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Box sx={{ "& p": { mb: 1.5 } }}>
                        <ReactMarkdown>{announcement.message}</ReactMarkdown>
                    </Box>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>{t("announcement.confirm_delete")}</DialogTitle>
                <DialogContent>
                    {t("announcement.delete_confirmation")}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>{t("announcement.cancel")}</Button>
                    <Button color="error" onClick={handleDelete}>{t("announcement.delete")}</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default AnnouncementItem;
