import React, { useEffect, useState, useContext } from "react";
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { AuthContext } from "../context/AuthContext";
import { getMyTeams, withdrawTeam } from "../api/registrations";

const MyTeamsPage = () => {
    const { t } = useTranslation();
    const { token } = useContext(AuthContext);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchTeams = async () => {
        setLoading(true);
        try {
            const res = await getMyTeams(token);
            setTeams(res.teams || []);
        } catch (err) {
            console.error(err);
            toast.error(t("teams.fetch_failed") || "Failed to fetch teams");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const handleWithdraw = async (team) => {
        try {
            await withdrawTeam(team.hackathon._id, team._id, token);
            toast.success(t("hackathon.withdraw_success") || "Withdrawn");
            fetchTeams();
        } catch (err) {
            console.error(err);
            toast.error(t("hackathon.withdraw_failed") || "Withdraw failed");
        }
    };

    return (
        <DashboardLayout>
            <Typography variant="h4" gutterBottom>
                {t("teams.my_teams") || "My Teams"}
            </Typography>

            <Paper variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>{t("hackathon.name") || "Hackathon"}</TableCell>
                            <TableCell>{t("team.name") || "Team"}</TableCell>
                            <TableCell>{t("team.idea") || "Idea"}</TableCell>
                            <TableCell>{t("team.members") || "Members"}</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(teams || []).map((team) => (
                            <TableRow key={team._id}>
                                <TableCell>{team.hackathon?.title || "-"}</TableCell>
                                <TableCell>{team.name}</TableCell>
                                <TableCell>{team.idea?.title || "-"}</TableCell>
                                <TableCell>{(team.members || []).map((m) => m.name).join(", ")}</TableCell>
                                <TableCell>
                                    <Button variant="outlined" color="error" size="small" onClick={() => handleWithdraw(team)}>
                                        {t("hackathon.withdraw") || "Withdraw"}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </DashboardLayout>
    );
};

export default MyTeamsPage;
