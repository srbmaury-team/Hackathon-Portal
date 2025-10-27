import React, { useState, useEffect, useCallback, useContext } from "react";
import {
    Typography,
    Paper,
    Box,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import RoleAccordion from "../components/members/RoleAccordion";
import { useTranslation } from "react-i18next";
import { getUsers, updateUserRole } from "../api/users";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
const UserManagementPage = () => {
    const { t } = useTranslation();
    const [groupedUsers, setGroupedUsers] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [newRole, setNewRole] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [updating, setUpdating] = useState(false);
    const token = localStorage.getItem("token");
    const { user } = useContext(AuthContext);
    const roles = ["participant", "organizer", "judge", "mentor", "admin"];

    const roleColors = {
        admin: "error",
        organizer: "primary",
        judge: "secondary",
        mentor: "info",
        participant: "default",
    };

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getUsers(token);
            setGroupedUsers(data.groupedUsers || {});
        } catch (err) {
            console.error(err);
            toast.error(t("user_management.fetch_failed"));
        } finally {
            setLoading(false);
        }
    }, [token, t]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleOpenDialog = (user) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedUser(null);
        setNewRole("");
    };

    const handleUpdateRole = async () => {
        if (!selectedUser || !newRole) return;

        try {
            setUpdating(true);
            await updateUserRole(selectedUser._id, newRole, token);
            toast.success(t("user_management.change_success"));
            handleCloseDialog();
            fetchUsers(); // Refresh the list
        } catch (err) {
            console.error(err);
            const errorMsg =
                err.response?.data?.message || t("user_management.change_failed");
            toast.error(errorMsg);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "60vh",
                    }}
                >
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                {(user.role === 'admin' || user.role === 'organizer') ? t("user_management.title") : t("user_management.users") }
            </Typography>

            {/* 🔍 Search Bar */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <TextField
                    variant="outlined"
                    placeholder={t("user_management.search_placeholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: 300 }}
                />
            </Box>

            {/* 🧩 User Groups */}
            {Object.keys(groupedUsers).length === 0 ? (
                <Paper sx={{ p: 4, textAlign: "center" }}>
                    <Typography color="text.secondary">
                        {t("user_management.no_users")}
                    </Typography>
                </Paper>
            ) : (
                Object.entries(groupedUsers).map(([roleKey, users]) => {
                    const filtered = users.filter(
                        (u) =>
                            u.name?.toLowerCase().includes(searchTerm) ||
                            u.email?.toLowerCase().includes(searchTerm)
                    );
                    if (!filtered.length) return null;

                    return (
                        <RoleAccordion
                            key={roleKey}
                            roleKey={roleKey}
                            users={filtered}
                            roleColors={roleColors}
                            t={t}
                            onChangeRoleClick={handleOpenDialog}
                            currentUser={user}
                        />
                    );
                })
            )}

            {/* 🧭 Change Role Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedUser &&
                        t("user_management.change_role_title", { name: selectedUser.name })}
                </DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>{t("user_management.select_new_role")}</InputLabel>
                        <Select
                            value={newRole}
                            label={t("user_management.select_new_role")}
                            onChange={(e) => setNewRole(e.target.value)}
                        >
                            {roles
                                .filter((role) => role !== "admin")
                                .map((role) => (
                                    <MenuItem key={role} value={role}>
                                        {t(`roles.${role}`)}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} disabled={updating}>
                        {t("announcement.cancel")}
                    </Button>
                    <Button
                        onClick={handleUpdateRole}
                        variant="contained"
                        disabled={updating || !newRole || newRole === selectedUser?.role}
                    >
                        {updating ? <CircularProgress size={24} /> : t("announcement.update")}
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
};

export default UserManagementPage;
