import React from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip
  } from "@mui/material";

  const UserTable = ({ users, roleColors, onChangeRoleClick, t, currentUser }) => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>{t("user_management.name")}</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>{t("user_management.email")}</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>{t("user_management.organization")}</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>{t("user_management.role")}</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>
              {t("user_management.actions")}
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id} hover>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.organization?.name || "N/A"}</TableCell>
              <TableCell>
                <Chip
                  label={t(`roles.${user.role}`)}
                  color={roleColors[user.role]}
                  size="small"
                />
              </TableCell>
              <TableCell align="right">
                {/* ✅ Only show button if:
                      - logged-in user is admin or organizer
                      - AND target user is not admin
                 */}
                {(currentUser?.role === "admin" || currentUser?.role === "organizer") &&
                  user.role !== "admin" && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => onChangeRoleClick(user)}
                    >
                      {t("user_management.change_role")}
                    </Button>
                  )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  export default UserTable;
