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
import { registerForHackathon } from "../../api/registrations";
import { getPublicIdeas, getUserIdeas } from "../../api/ideas";
import { getUsers } from "../../api/users";
import MemberSearchPicker from "./MemberSearchPicker";

const HackathonRegisterModal = ({ open, onClose, hackathon }) => {
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
                    getUserIdeas(token),
                    getUsers(token),
                ]);

                // ✅ filter only the ideas created by this user
                const userIdeas = (ideasRes?.ideas || []).filter(
                    (idea) => idea.submitter === user?._id
                );

                setIdeas(userIdeas);

                const allUsers = usersRes?.groupedUsers
                    ? Object.values(usersRes.groupedUsers).flat()
                    : [];
                setUsers(allUsers);
            } catch (error) {
                console.error(error);
                toast.error(t("hackathon.details_fetch_failed") || "Failed to fetch data!");
            }
        };

        fetchData();
    }, [hackathon, open, token, user, t]);

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
            await registerForHackathon(hackathon._id, payload, token);
            toast.success(t("hackathon.register_success") || "Registered successfully!");
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
