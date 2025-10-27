import React, { useState } from "react";
import {
    Box,
    Paper,
    Card,
    CardContent,
    Typography,
    Stack,
    Button,
    useTheme,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import dayjs from "dayjs";
import MarkdownViewer from "../common/MarkdownViewer";
import RegisterTeamModal from "../teams/HackathonRegisterModal"; // 👈 Import modal

const HackathonItem = ({ hackathon, onEdit, onDelete }) => {
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);
    const theme = useTheme();
    const colorScheme = theme.palette.mode === "dark" ? "dark" : "light";

    const [openRegister, setOpenRegister] = useState(false);

    const showDate =
        hackathon.createdAt === hackathon.updatedAt
            ? `${t("hackathon.created_at")}: ${dayjs(hackathon.createdAt).format("DD MMM YYYY")}`
            : `${t("hackathon.last_updated_at")}: ${dayjs(hackathon.updatedAt).format("DD MMM YYYY")}`;

    return (
        <>
            <Card sx={{ mb: 3, position: "relative" }}>
                <CardContent>
                    <Box sx={{ position: "absolute", top: 16, right: 16 }}>
                        <Typography variant="caption" color="text.secondary">
                            {showDate}
                        </Typography>
                    </Box>

                    <Typography variant="h6">{hackathon.title}</Typography>
                    <MarkdownViewer content={hackathon.description} colorScheme={colorScheme} />
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        {t("hackathon.status")}:{" "}
                        {hackathon.isActive ? t("hackathon.active") : t("hackathon.inactive")}
                    </Typography>

                    {hackathon.rounds?.length > 0 && (
                        <Paper variant="outlined" sx={{ mb: 2, overflowX: "auto" }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t("hackathon.round_number")}</TableCell>
                                        <TableCell>{t("hackathon.round_name")}</TableCell>
                                        <TableCell>{t("hackathon.round_description")}</TableCell>
                                        <TableCell>{t("hackathon.round_start_date")}</TableCell>
                                        <TableCell>{t("hackathon.round_end_date")}</TableCell>
                                        <TableCell>{t("hackathon.status")}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {hackathon.rounds.map((round, index) => (
                                        <TableRow key={round._id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{round.name}</TableCell>
                                            <TableCell>{round.description}</TableCell>
                                            <TableCell>{round.startDate?.split("T")[0]}</TableCell>
                                            <TableCell>{round.endDate?.split("T")[0]}</TableCell>
                                            <TableCell>
                                                {round.isActive
                                                    ? t("hackathon.active")
                                                    : t("hackathon.inactive")}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Paper>
                    )}

                    <Stack direction="row" spacing={1}>
                        {(user.role === "admin" || user.role === "organizer") && (
                            <>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => onEdit(hackathon)}
                                >
                                    {t("hackathon.edit")}
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    color="error"
                                    onClick={() => onDelete(hackathon._id)}
                                >
                                    {t("hackathon.delete")}
                                </Button>
                            </>
                        )}
                        {user.role === "participant" && (
                            <Button
                                variant="contained"
                                size="small"
                                sx={{ mt: 1 }}
                                onClick={() => setOpenRegister(true)}
                            >
                                {t("hackathon.register")}
                            </Button>
                        )}
                    </Stack>
                </CardContent>
            </Card>

            {/* Registration Modal */}
            <RegisterTeamModal
                open={openRegister}
                onClose={() => setOpenRegister(false)}
                hackathon={hackathon}
            />
        </>
    );
};

export default HackathonItem;
