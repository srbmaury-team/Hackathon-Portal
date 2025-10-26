import React, { useEffect, useState, useContext } from "react";
import { Box, Typography } from "@mui/material";
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
} from "../api/api";
import DashboardLayout from "../components/dashboard/DashboardLayout";

const HackathonPage = () => {
    const { t } = useTranslation();
    const { token } = useContext(AuthContext);
    const [hackathons, setHackathons] = useState([]);
    const [editingHackathon, setEditingHackathon] = useState(null);
    const { user } = useContext(AuthContext);

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
        await createHackathon(data, token);
        fetchHackathons();
        setEditingHackathon(null);
    };

    const handleUpdate = async (data) => {
        if (!editingHackathon) return;
        await updateHackathon(editingHackathon._id, data, token);
        fetchHackathons();
        setEditingHackathon(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm(t("hackathon.confirm_delete"))) {
            await deleteHackathon(id, token);
            fetchHackathons();
        }
    };

    const handleEdit = (hackathon) => {
        setEditingHackathon(hackathon);
    };

    return (
        <DashboardLayout>
            <Typography variant="h4" gutterBottom>
                {t("hackathon.hackathons")}
            </Typography>

            {(user.role === "admin" || user.role === "organizer")  &&
                <HackathonForm
                    initialData={editingHackathon}
                    onSubmit={editingHackathon ? handleUpdate : handleCreate}
                />}

            <Box mt={4}>
                <HackathonList
                    hackathons={hackathons}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </Box>
        </DashboardLayout>
    );
};

export default HackathonPage;
