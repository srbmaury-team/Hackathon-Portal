import React, { useState, useEffect } from "react";
import {
    Container,
    Paper,
    Typography,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Divider,
} from "@mui/material";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { getPublicIdeas } from "../api/ideas";
import IdeasTable from "../components/ideas/IdeasTable";
import { useTranslation } from "react-i18next";

const PublicIdeasPage = () => {
    const { t } = useTranslation();
    const [ideas, setIdeas] = useState([]);
    const [filter, setFilter] = useState("all");
    const token = localStorage.getItem("token");

    const fetchPublicIdeas = async () => {
        try {
            const { ideas } = await getPublicIdeas(token);
            setIdeas(ideas);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchPublicIdeas();
    }, []);

    return (
        <DashboardLayout>
            <Container
                maxWidth="lg"
                sx={{
                    mt: 3,
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                }}
            >
                {/* Header */}
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Typography variant="h5" fontWeight={600}>
                        {t("idea.public_ideas")}
                    </Typography>
                </Stack>

                {/* Filters */}
                <Stack direction="row" spacing={2}>
                    <ToggleButtonGroup
                        value={filter}
                        exclusive
                        onChange={(e, newFilter) =>
                            newFilter && setFilter(newFilter)
                        }
                        size="small"
                    >
                        <ToggleButton value="all">{t("idea.all")}</ToggleButton>
                        <ToggleButton value="mine">{t("idea.mine")}</ToggleButton>
                        <ToggleButton value="others">{t("idea.others")}</ToggleButton>
                    </ToggleButtonGroup>
                </Stack>

                <Divider sx={{ mb: 2 }} />

                {/* Table */}
                <Paper elevation={2} sx={{ borderRadius: 2, p: 2 }}>
                    <IdeasTable ideas={ideas} filter={filter} showActions={false} />
                </Paper>
            </Container>
        </DashboardLayout>
    );
};

export default PublicIdeasPage;
