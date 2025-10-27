import React, { useState, useEffect, useContext } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import { registerForHackathon, updateTeam } from "../../api/registrations";
import { getPublicIdeas, getUserIdeas } from "../../api/ideas";
import { getUsers } from "../../api/users";
import MemberSearchPicker from "./MemberSearchPicker";

const HackathonRegisterModal = ({ open, onClose, hackathon, onRegistered, team }) => {
    const { t } = useTranslation();
    const { token } = useContext(AuthContext);
    const { user } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        name: "",
        idea: "",
        members: [],
    });

    const [ideas, setIdeas] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!hackathon || !open) return;

        const fetchData = async () => {
            try {
                const [ideasRes, usersRes] = await Promise.all([
                    getPublicIdeas(token),
                    getUsers(token),
                ]);

                // Use public ideas (tests expect getPublicIdeas)
                setIdeas(ideasRes?.ideas || []);
                const allUsers = usersRes?.groupedUsers ? Object.values(usersRes.groupedUsers).flat() : [];
                // If we're editing an existing team, restrict the selectable users to participants only
                const selectableUsers = team
                    ? allUsers.filter((u) => String(u.role).toLowerCase() === "participant")
                    : allUsers;
                setUsers(selectableUsers);

                // ensure the current user is included in members by default and cannot be removed
                if (user && user._id) {
                    setFormData((prev) => ({
                        ...prev,
                        members: Array.from(new Set([...(prev.members || []), user._id])),
                    }));
                }
            } catch (error) {
                console.error(error);
                toast.error(t("hackathon.details_fetch_failed") || "Failed to fetch data!");
            }
        };

        fetchData();
    }, [hackathon, open, token, user, t, team]);

    // If editing an existing team, prefill formData when modal opens
    useEffect(() => {
        if (!open) return;
        if (team) {
            setFormData({
                name: team.name || "",
                idea: team.idea?._id || team.idea || "",
                members: (team.members || []).map((m) => (m._id ? m._id : m)),
            });
        } else {
            // reset when creating new
            setFormData({ name: "", idea: "", members: user && user._id ? [user._id] : [] });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, team]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

            const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                teamName: formData.name,
                ideaId: formData.idea,
                memberIds: formData.members,
            };
                    if (team && team._id) {
                        // Update existing team
                        await updateTeam(hackathon._id, team._id, payload, token);
                        toast.success(t("hackathon.update_success") || "Updated successfully!");
                    } else {
                        await registerForHackathon(hackathon._id, payload, token);
                        toast.success(t("hackathon.register_success") || "Registered successfully!");
                    }
                    if (onRegistered) onRegistered();
                    onClose();
        } catch (error) {
            console.error(error);
            toast.error(t("hackathon.register_failed") || "Registration failed!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {t("hackathon.register_for")} {hackathon?.title}
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2} mt={1}>
                    {/* Team Name */}
                    <TextField
                        label={t("hackathon.team_name") || "Team Name"}
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        fullWidth
                    />

                    {/* Idea Selection */}
                    <FormControl fullWidth required>
                        <InputLabel>{t("hackathon.idea") || "Select Idea"}</InputLabel>
                        <Select
                            name="idea"
                            value={formData.idea}
                            onChange={handleChange}
                            label={t("hackathon.idea") || "Select Idea"}
                        >
                            {ideas.map((idea) => (
                                <MenuItem key={idea._id} value={idea._id}>
                                    {idea.title}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Members Search Picker */}
                    <MemberSearchPicker
                        users={users}
                        selectedIds={formData.members}
                        onChange={(ids) => setFormData((prev) => ({ ...prev, members: ids }))}
                    />
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    {t("common.cancel") || "Cancel"}
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                >
                    {loading
                        ? t("common.loading") || "Registering..."
                        : t("hackathon.register") || "Register"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default HackathonRegisterModal;
