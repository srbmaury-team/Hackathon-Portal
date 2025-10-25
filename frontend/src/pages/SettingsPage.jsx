import React, { useContext } from "react";
import {
    Container,
    Typography,
    Stack,
    Card,
    CardContent,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    Switch,
} from "@mui/material";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { SettingsContext } from "../context/SettingsContext.jsx";
import { useTranslation } from "react-i18next";

const SettingsPage = () => {
    const { theme, setTheme, language, setLanguage } =
        useContext(SettingsContext);
    const { t } = useTranslation();

    return (
        <DashboardLayout>
            <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    {t("settings.title")}
                </Typography>

                <Stack spacing={4}>
                    {/* THEME CARD */}
                    <Card
                        sx={{
                            borderRadius: 3,
                            overflow: "hidden",
                            border: (theme) =>
                                `1px solid ${theme.palette.divider}`,
                        }}
                    >
                        <CardContent>
                            <Typography
                                variant="h6"
                                fontWeight={600}
                                gutterBottom
                            >
                                {t("settings.theme")}
                            </Typography>
                            <FormControl component="fieldset">
                                <RadioGroup
                                    row
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value)}
                                >
                                    <FormControlLabel
                                        value="light"
                                        control={<Radio color="primary" />}
                                        label={t("settings.light")}
                                    />
                                    <FormControlLabel
                                        value="dark"
                                        control={<Radio color="primary" />}
                                        label={t("settings.dark")}
                                    />
                                    <FormControlLabel
                                        value="system"
                                        control={<Radio color="primary" />}
                                        label={t("settings.system")}
                                    />
                                </RadioGroup>
                            </FormControl>
                        </CardContent>
                    </Card>

                    {/* LANGUAGE CARD */}
                    <Card
                        sx={{
                            borderRadius: 3,
                            overflow: "hidden",
                            border: (theme) =>
                                `1px solid ${theme.palette.divider}`,
                        }}
                    >
                        <CardContent>
                            <Typography
                                variant="h6"
                                fontWeight={600}
                                gutterBottom
                            >
                                {t("settings.language")}
                            </Typography>
                            <FormControl component="fieldset">
                                <RadioGroup
                                    row
                                    value={language}
                                    onChange={(e) =>
                                        setLanguage(e.target.value)
                                    }
                                >
                                    <FormControlLabel
                                        value="en"
                                        control={<Radio color="primary" />}
                                        label="English"
                                    />
                                    <FormControlLabel
                                        value="hi"
                                        control={<Radio color="primary" />}
                                        label="हिन्दी"
                                    />
                                    <FormControlLabel
                                        value="te"
                                        control={<Radio color="primary" />}
                                        label="తెలుగు"
                                    />
                                </RadioGroup>
                            </FormControl>
                        </CardContent>
                    </Card>

                    {/* NOTIFICATIONS CARD */}
                    <Card
                        sx={{
                            borderRadius: 3,
                            overflow: "hidden",
                            border: (theme) =>
                                `1px solid ${theme.palette.divider}`,
                        }}
                    >
                        <CardContent>
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                            >
                                <Typography variant="h6" fontWeight={600}>
                                    {t("settings.notifications")}
                                </Typography>
                                <Switch color="primary" />
                            </Stack>
                        </CardContent>
                    </Card>
                </Stack>
            </Container>
        </DashboardLayout>
    );
};

export default SettingsPage;
