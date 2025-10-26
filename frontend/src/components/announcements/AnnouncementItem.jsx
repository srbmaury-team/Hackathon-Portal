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
    TextField,
    useTheme,
} from "@mui/material";
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
    const theme = useTheme();
    const { t } = useTranslation();

    const isOrganizer = user.role === "organizer";
    const isAdmin = user.role === "admin";
    const canEdit = isAdmin || (isOrganizer && announcement.createdBy._id === user._id);
    const canDelete = isAdmin || (isOrganizer && announcement.createdBy._id === user._id);
    
    // Determine color scheme based on theme
    const colorScheme = theme.palette.mode === "dark" ? "dark" : "light";

    // Delete using api.js
    const handleDelete = async () => {
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
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        {t("announcement.edit_announcement")}
                    </Typography>
                    <TextField
                        label={t("announcement.title")}
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        fullWidth
                        sx={{ mb: 2 }}
                    />
                    <Box data-color-mode={colorScheme}>
                        <MDEditor value={editedMessage} onChange={setEditedMessage} height={300} />
                    </Box>
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
                            <IconButton size="small" sx={{ color: "white" }} onClick={() => setEditing(true)}>
                                <EditIcon />
                            </IconButton>
                        )}
                        {canDelete && (
                            <IconButton size="small" sx={{ color: "white" }} onClick={() => setConfirmOpen(true)}>
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

                    <Box 
                        data-color-mode={colorScheme}
                        sx={{ 
                            "& .wmde-markdown": {
                                backgroundColor: "transparent !important",
                                color: "text.primary"
                            },
                            "& .wmde-markdown-color": {
                                backgroundColor: "transparent !important"
                            },
                            "& p": { mb: 1.5 },
                            "& h1, & h2, & h3, & h4, & h5, & h6": {
                                color: "text.primary",
                                mt: 2,
                                mb: 1
                            },
                            "& img": { 
                                maxWidth: "100%", 
                                height: "auto",
                                borderRadius: 2,
                                mt: 1,
                                mb: 1
                            },
                            "& pre": {
                                backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e !important" : "#f5f5f5 !important",
                                padding: 2,
                                borderRadius: 1,
                                overflow: "auto"
                            },
                            "& code": {
                                backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5",
                                padding: "2px 6px",
                                borderRadius: 1
                            },
                            "& a": {
                                color: "primary.main"
                            },
                            "& ul, & ol": {
                                pl: 2,
                                mb: 1.5
                            },
                            "& li": {
                                mb: 0.5
                            },
                            "& blockquote": {
                                borderLeft: `4px solid ${theme.palette.primary.main}`,
                                pl: 2,
                                py: 1,
                                my: 2,
                                color: "text.secondary",
                                backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"
                            }
                        }}
                    >
                        <MDEditor.Markdown source={announcement.message} />
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
