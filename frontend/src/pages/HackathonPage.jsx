import React, { useEffect, useState, useContext } from "react";
import {
    Box,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import HackathonForm from "../components/hackathons/HackathonForm";
import HackathonList from "../components/hackathons/HackathonList";
import {
    getAllHackathons,
    createHackathon,
    updateHackathon,
    deleteHackathon,
    getHackathonById,
} from "../api/hackathons";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import HackathonRegisterModal from "../components/teams/HackathonRegisterModal";
import ConfirmDialog from "../components/common/ConfirmDialog";

const HackathonPage = () => {
    const { t } = useTranslation();
    const { token, user } = useContext(AuthContext);
    const [hackathons, setHackathons] = useState([]);
    const [editingHackathon, setEditingHackathon] = useState(null);

    // For Delete Confirmation Dialog
    const [selectedHackathon, setSelectedHackathon] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const fetchHackathons = async () => {
        try {
            const res = await getAllHackathons(token);
            setHackathons(res.hackathons);
        } catch (err) {
            console.error(err);
            toast.error(t("hackathon.fetch_failed"));
        }
    };

    useEffect(() => {
        fetchHackathons();
    }, [token]);

    const handleCreate = async (data) => {
        try {
            await createHackathon(data, token);
            toast.success(t("hackathon.created"));
            fetchHackathons();
            setEditingHackathon(null);
        } catch (err) {
            console.error(err);
            toast.error(t("hackathon.create_failed"));
        }
    };

    const handleUpdate = async (data) => {
        if (!editingHackathon) return;
        try {
            await updateHackathon(editingHackathon._id, data, token);
            toast.success(t("hackathon.updated"));
            fetchHackathons();
            setEditingHackathon(null);
        } catch (err) {
            console.error(err);
            toast.error(t("hackathon.update_failed"));
        }
    };

    const handleDeleteClick = async (hackathon) => {
        try {
            const res = await getHackathonById(hackathon, token);
            setSelectedHackathon(res.hackathon || hackathon);
            setDeleteDialogOpen(true);
        } catch (err) {
            console.error(err);
            toast.error(t("hackathon.delete_failed"));
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedHackathon) return;
        try {
            await deleteHackathon(selectedHackathon._id, token);
            toast.success(t("hackathon.deleted"));
            fetchHackathons();
        } catch (err) {
            console.error(err);
            toast.error(t("hackathon.delete_failed"));
        } finally {
            setDeleteDialogOpen(false);
            setSelectedHackathon(null);
        }
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setSelectedHackathon(null);
    };

    const handleEdit = (hackathon) => {
        setEditingHackathon(hackathon);
    };

    return (
        <DashboardLayout>
            <Typography variant="h4" gutterBottom>
                {t("hackathon.hackathons")}
            </Typography>

            {(user.role === "admin" || user.role === "organizer") && (
                <HackathonForm
                    initialData={editingHackathon}
                    onSubmit={editingHackathon ? handleUpdate : handleCreate}
                />
            )}

            <Box mt={4}>
                <HackathonList
                    hackathons={hackathons}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                />
            </Box>

            <ConfirmDialog
                open={deleteDialogOpen}
                title={t("hackathon.confirm_delete_title")}
                message={t("hackathon.confirm_delete_message", {
                    name: selectedHackathon?.title || "",
                })}
                confirmText={t("common.delete")}
                cancelText={t("common.cancel")}
                confirmColor="error"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </DashboardLayout>
    );
};

export default HackathonPage;
