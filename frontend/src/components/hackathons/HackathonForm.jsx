import React, { useState, useEffect } from "react";
import {
    Paper,
    Typography,
    TextField,
    Button,
    Stack,
    Checkbox,
    FormControlLabel,
    IconButton,
    Grid,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import MDEditor from "@uiw/react-md-editor";
import { useTheme } from "@mui/material/styles";

const HackathonForm = ({ onSubmit, initialData }) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const colorScheme = theme.palette.mode === "dark" ? "dark" : "light";

    const [title, setTitle] = useState(initialData?.title || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [isActive, setIsActive] = useState(initialData?.isActive ?? false);
    const [rounds, setRounds] = useState(initialData?.rounds || []);

    useEffect(() => {
        setTitle(initialData?.title || "");
        setDescription(initialData?.description || "");
        setIsActive(initialData?.isActive ?? false);
        setRounds(initialData?.rounds || []);
    }, [initialData]);

    const handleAddRound = () =>
        setRounds([...rounds, { name: "", description: "", startDate: "", endDate: "", isActive: false }]);

    const handleRoundChange = (index, field, value) => {
        const updated = [...rounds];
        updated[index][field] = value;
        setRounds(updated);
    };

    const handleRemoveRound = (index) => {
        const updated = [...rounds];
        updated.splice(index, 1);
        setRounds(updated);
    };

    const handleSubmit = async () => {
        if (!title || !description) return toast.error(t("hackathon.all_fields_required"));

        const formattedRounds = rounds.map((r) => ({
            ...r,
            startDate: r.startDate && r.startDate.trim() ? new Date(r.startDate).toISOString() : undefined,
            endDate: r.endDate && r.endDate.trim() ? new Date(r.endDate).toISOString() : undefined,
            isActive: !!r.isActive,
            name: r.name?.trim() || "",
            description: r.description?.trim() || "",
        }));

        const payload = {
            title: title.trim(),
            description: description.trim(),
            isActive,
            rounds: formattedRounds,
        };

        console.log("Submitting hackathon payload:", JSON.stringify(payload, null, 2));

        try {
            await onSubmit(payload);
            toast.success(initialData ? t("hackathon.updated") : t("hackathon.created"));
            setTitle("");
            setDescription("");
            setIsActive(false);
            setRounds([]);
        } catch (err) {
            console.error("Hackathon submission error:", err);
            toast.error(initialData ? t("hackathon.update_failed") : t("hackathon.create_failed"));
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h5" fontWeight={600}>
                {initialData ? t("hackathon.edit_hackathon") : t("hackathon.create_hackathon")}
            </Typography>

            <Stack spacing={2} mt={2}>
                <TextField
                    fullWidth
                    label={t("hackathon.title")}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                {/* Markdown Editor for description */}
                <div data-color-mode={colorScheme}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        {t("hackathon.description")}
                    </Typography>
                    <MDEditor
                        value={description}
                        onChange={setDescription}
                        height={300}
                        preview="edit"
                    />
                </div>

                <FormControlLabel
                    control={<Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
                    label={t("hackathon.is_active")}
                />

                <Typography variant="subtitle1" fontWeight={600}>
                    {t("hackathon.rounds")}
                </Typography>

                {rounds.map((round, index) => (
                    <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label={t("hackathon.round_name")}
                                    value={round.name}
                                    onChange={(e) => handleRoundChange(index, "name", e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label={t("hackathon.round_description")}
                                    value={round.description}
                                    onChange={(e) => handleRoundChange(index, "description", e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label={t("hackathon.round_start_date")}
                                    value={round.startDate?.split("T")[0] || ""}
                                    onChange={(e) => handleRoundChange(index, "startDate", e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label={t("hackathon.round_end_date")}
                                    value={round.endDate?.split("T")[0] || ""}
                                    onChange={(e) => handleRoundChange(index, "endDate", e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={round.isActive ?? false}
                                            onChange={(e) => handleRoundChange(index, "isActive", e.target.checked)}
                                        />
                                    }
                                    label={t("hackathon.is_active")}
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <IconButton color="error" onClick={() => handleRemoveRound(index)}>
                                    <Delete />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Paper>
                ))}

                <Button startIcon={<Add />} onClick={handleAddRound}>
                    {t("hackathon.add_round")}
                </Button>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    sx={{ alignSelf: "flex-start", px: 4 }}
                >
                    {initialData ? t("hackathon.update") : t("hackathon.create")}
                </Button>
            </Stack>
        </Paper>
    );
};

export default HackathonForm;
