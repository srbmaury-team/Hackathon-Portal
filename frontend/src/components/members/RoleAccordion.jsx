// components/user/RoleAccordion.jsx
import React from "react";
import {
    Accordion, AccordionSummary, AccordionDetails, Box, Typography, Chip
  } from "@mui/material";
  import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
  import PersonIcon from "@mui/icons-material/Person";
  import UserTable from "./UserTable";

  const RoleAccordion = ({ roleKey, users, roleColors, t, onChangeRoleClick, currentUser }) => (
    <Accordion key={roleKey} defaultExpanded={roleKey !== "participant"} sx={{ mb: 2, borderRadius: 2 }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ backgroundColor: "action.hover", borderRadius: 1 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
          <PersonIcon color={roleColors[roleKey]} />
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            {t(`roles.${roleKey}`)}
          </Typography>
          <Chip label={users.length} color={roleColors[roleKey]} size="small" sx={{ ml: "auto", mr: 2 }} />
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <UserTable users={users} roleColors={roleColors} onChangeRoleClick={onChangeRoleClick} t={t} currentUser={currentUser} />
      </AccordionDetails>
    </Accordion>
  );

  export default RoleAccordion;
