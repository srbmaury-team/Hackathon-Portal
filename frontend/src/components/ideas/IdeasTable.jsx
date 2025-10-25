import React, { useContext, useState } from "react";
import {
    Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Checkbox, Stack, Typography
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { editIdea, deleteIdea } from "../../api/api";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const IdeasTable = ({ ideas = [], filter, onIdeaUpdated, showActions = false }) => {
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);
    const token = localStorage.getItem("token");
    const [selectedIdea, setSelectedIdea] = useState(null);
    const [editData, setEditData] = useState({ title: "", description: "", isPublic: true });

    const handleEditClick = (idea) => {
        setSelectedIdea(idea);
        setEditData({ title: idea.title, description: idea.description, isPublic: idea.isPublic });
    };

    const handleClose = () => setSelectedIdea(null);

    const handleSave = async () => {
        try {
            await editIdea(selectedIdea._id, editData, token);
            toast.success(t("idea.idea_updated"));
            handleClose();
            onIdeaUpdated();
        } catch (err) {
            console.error(err);
            toast.error(t("idea.idea_update_failed"));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t("idea.idea_delete_confirm") || "Are you sure?")) return;
        try {
            await deleteIdea(id, token);
            toast.success(t("idea.idea_deleted"));
            onIdeaUpdated();
        } catch (err) {
            console.error(err);
            toast.error(t("idea.idea_delete_failed"));
        }
    };

    const filteredIdeas =
        filter === "all"
            ? ideas
            : (filter === "mine"
                ? ideas.filter(idea => idea.submitter._id === user._id)
                : (filter === "others"
                    ? ideas.filter(idea => idea.submitter._id !== user._id)
                    : (filter === "public"
                        ? ideas.filter(idea => idea.isPublic)
                        : ideas.filter(idea => !idea.isPublic))));

    return (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Table>
                <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell><b>{t("idea.number")}</b></TableCell>
                        <TableCell><b>{t("idea.title")}</b></TableCell>
                        <TableCell><b>{t("idea.description")}</b></TableCell>
                        <TableCell><b>{t("idea.visibility")}</b></TableCell>
                        <TableCell align="right"><b>{showActions ? t("idea.actions") : t("idea.submitter")}</b></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredIdeas.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} align="center">
                                <Typography variant="body2" color="text.secondary">{t("idea.no_ideas")}</Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredIdeas.map((idea, index) => (
                            <TableRow key={idea._id} sx={{ "&:hover": { bgcolor: "action.hover" }, transition: "background-color 0.2s" }}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{idea.title}</TableCell>
                                <TableCell sx={{ maxWidth: 350, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{idea.description}</TableCell>
                                <TableCell>{idea.isPublic ? t("idea.public") : t("idea.private")}</TableCell>
                                <TableCell align="right">
                                    {showActions ? (
                                        <>
                                            <IconButton
                                                aria-label={t("idea.edit")}
                                                onClick={() => handleEditClick(idea)}
                                                data-testid="edit-button"
                                            >
                                                <Edit />
                                            </IconButton>
                                            <IconButton
                                                aria-label={t("idea.delete")}
                                                onClick={() => handleDelete(idea._id)}
                                                data-testid="delete-button"
                                            >
                                                <Delete color="error" />
                                            </IconButton>
                                        </>
                                    ) : (
                                        idea.submitter?.name || idea.submitter?.email || "Unknown"
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {showActions && (
                <Dialog open={!!selectedIdea} onClose={handleClose} maxWidth="sm" fullWidth>
                    <DialogTitle>{t("idea.edit_idea")}</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <TextField fullWidth label={t("idea.title")} value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} />
                            <TextField fullWidth multiline rows={4} label={t("idea.description")} value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} />
                            <Stack direction="row" alignItems="center">
                                <Checkbox checked={editData.isPublic} onChange={e => setEditData({ ...editData, isPublic: e.target.checked })} />
                                <Typography>{t("idea.make_public")}</Typography>
                            </Stack>
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="inherit">{t("idea.cancel")}</Button>
                        <Button onClick={handleSave} variant="contained" color="primary">{t("idea.save_changes")}</Button>
                    </DialogActions>
                </Dialog>
            )}
        </TableContainer>
    );
};

export default IdeasTable;
