import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import {
	Card,
	CardContent,
	Typography,
	Box,
	Select,
	MenuItem,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	useTheme,
	CircularProgress,
	Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { getUsers } from "../api/api";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { AuthContext } from "../context/AuthContext";

const roles = ["participant", "organizer", "judge", "mentor"];

const UserManagementPage = () => {
	const theme = useTheme();
	const { t } = useTranslation();
	const { user: currentUser } = useContext(AuthContext);

	// read token once (you may also move this interceptor into API)
	const token = useMemo(() => localStorage.getItem("token"), []);

	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const [newRole, setNewRole] = useState("");
	const [open, setOpen] = useState(false);

	const isAdmin = currentUser?.role === "admin";
	const isOrganizer = currentUser?.role === "organizer";

	// only authorized roles may fetch users
	const canView = isAdmin || isOrganizer;

	const parseUsersResponse = (res) => {
		if (!res) return [];
		// backend returns { groupedUsers: { role: [users] } }
		const grouped = res.data?.groupedUsers ?? res.data ?? {};

		if (Array.isArray(grouped)) return grouped.filter(Boolean);

		try {
			return Object.values(grouped).flat().filter(Boolean);
		} catch (e) {
			return [];
		}
	};

	const fetchUsers = useCallback(async () => {
		if (!canView) return; // don't call protected endpoint

		setLoading(true);
		try {
			const res = await getUsers(token);

			const all = parseUsersResponse(res);
			setUsers(all);
		} catch (err) {
			// log full response to help debugging
			console.error("UserManagement: fetchUsers error", err?.response?.status, err?.response?.data || err.message);

			// show toast at most once per session for this component
			if (!fetchUsers.hasShownError) {
				toast.error(err.response?.data?.message || t("user_management.fetch_failed"));
				fetchUsers.hasShownError = true;
			}
		} finally {
			setLoading(false);
		}
	}, [canView, token, t]);

	useEffect(() => {
		// Wait until we have a currentUser; this avoids calling protected endpoint for anonymous users
		if (!currentUser) return;
		if (!canView) return;
		fetchUsers();
	}, [currentUser, canView, fetchUsers]);

	const canEditUser = (targetUser) => {
		if (!targetUser || !currentUser) return false;
		return (isAdmin || isOrganizer) && targetUser.role !== "admin" && targetUser._id !== currentUser._id;
	};

	const handleOpenEdit = (userObj) => {
		setSelectedUser(userObj);
		setNewRole(userObj.role);
		setOpen(true);
	};

	const handleRoleUpdate = async () => {
		if (!selectedUser) return;
		try {
			await API.put(
				`/users/${selectedUser._id}/role`,
				{ role: newRole },
				{ headers: { Authorization: `Bearer ${token}` } }
			);

			toast.success(t("user_management.change_success"));
			setUsers((prev) => prev.map((u) => (u._id === selectedUser._id ? { ...u, role: newRole } : u)));
		} catch (err) {
			console.error("UserManagement: update role error", err?.response?.status, err?.response?.data || err.message);
			toast.error(err.response?.data?.message || t("user_management.change_failed"));
		} finally {
			setOpen(false);
		}
	};

	return (
		<DashboardLayout>
			<Box p={3}>
				<Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
					<Typography variant="h4">{t("user_management.title")}</Typography>

					<Box>
						<IconButton onClick={fetchUsers} disabled={!canView || loading} title={t("user_management.refresh")}> 
							<RefreshIcon />
						</IconButton>
					</Box>
				</Stack>

				{!currentUser ? (
					<Typography color="text.secondary">{t("user_management.loading_user")}</Typography>
				) : !canView ? (
					<Typography color="text.secondary">{t("user_management.not_authorized")}</Typography>
				) : loading ? (
					<Box display="flex" justifyContent="center" mt={4}>
						<CircularProgress />
					</Box>
				) : users.length > 0 ? (
					users.map((user) => (
						<Card
							key={user._id}
							sx={{
								mb: 2,
								backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
							}}
						>
							<CardContent>
								<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
									<Box>
										<Typography variant="h6">{user.name}</Typography>
										<Typography variant="body2" color="text.secondary">
											{user.email}
										</Typography>
										<Typography variant="body2" sx={{ mt: 0.5 }}>
											{t("user_management.organization")} : {user.organization?.name || "-"}
										</Typography>
										<Typography variant="body2" sx={{ mt: 0.5 }}>
											{t("user_management.role")} : {t(`roles.${user.role}`)}
										</Typography>
									</Box>

									{canEditUser(user) && (
										<IconButton color="primary" onClick={() => handleOpenEdit(user)}>
											<EditIcon />
										</IconButton>
									)}
								</Box>
							</CardContent>
						</Card>
					))
				) : (
					<Typography sx={{ mt: 3 }} color="text.secondary">
						{t("user_management.no_users")}
					</Typography>
				)}

				<Dialog open={open} onClose={() => setOpen(false)}>
					<DialogTitle>
						{t("user_management.change_role_title", {
							name: selectedUser?.name,
						})}
					</DialogTitle>
					<IconButton sx={{ position: "absolute", right: 8, top: 8 }} onClick={() => setOpen(false)}>
						<CloseIcon />
					</IconButton>
					<DialogContent>
						<Typography sx={{ mb: 2 }}>{t("user_management.select_new_role")}</Typography>
						<Select fullWidth value={newRole} onChange={(e) => setNewRole(e.target.value)}>
							{roles.map((r) => (
								<MenuItem key={r} value={r}>
									{t(`roles.${r}`)}
								</MenuItem>
							))}
						</Select>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => setOpen(false)} color="inherit">
							{t("announcement.cancel")}
						</Button>
						<Button onClick={handleRoleUpdate} variant="contained" color="primary">
							{t("announcement.update")}
						</Button>
					</DialogActions>
				</Dialog>
			</Box>
		</DashboardLayout>
	);
};

export default UserManagementPage;
