// src/components/hackathons/MemberSearchPicker.jsx
import React, { useEffect, useMemo, useState, useContext } from "react";
import {
    TextField,
    List,
    ListItem,
    ListItemText,
    Checkbox,
    Chip,
    Stack,
    Typography,
} from "@mui/material";

// ------------------ TRIE IMPLEMENTATION ------------------
class TrieNode {
    constructor() {
        this.children = {};
        this.isEnd = false;
        this.users = [];
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(user) {
        let node = this.root;
        const key = user.name.toLowerCase();
        for (const ch of key) {
            if (!node.children[ch]) node.children[ch] = new TrieNode();
            node = node.children[ch];
            node.users.push(user);
        }
        node.isEnd = true;
    }

    search(prefix) {
        let node = this.root;
        prefix = prefix.toLowerCase();
        for (const ch of prefix) {
            if (!node.children[ch]) return [];
            node = node.children[ch];
        }
        return node.users.slice(0, 10);
    }
}
// ----------------------------------------------------------

import { AuthContext } from "../../context/AuthContext";

const MemberSearchPicker = ({ users, selectedIds = [], onChange }) => {
    const auth = useContext(AuthContext) || {};
    const user = auth.user;
    const [query, setQuery] = useState("");
    const [filtered, setFiltered] = useState([]);

    const trie = useMemo(() => new Trie(), []);

    // Build Trie once users are available
    useEffect(() => {
        if (!users?.length) return;
        const t = new Trie();
        users.forEach((u) => t.insert(u));
        Object.assign(trie, t);
    }, [users, trie]);

    const handleSearch = (e) => {
        const val = e.target.value;
        setQuery(val);
        if (!val.trim()) return setFiltered([]);
        const res = trie.search(val);
        setFiltered(res);
    };

    const handleToggle = (id) => {
        // Prevent removing the current user from the team
        if (selectedIds.includes(id) && String(id) === String(user?._id)) return;

        let updated;
        if (selectedIds.includes(id)) {
            updated = selectedIds.filter((sid) => sid !== id); // remove id
        } else {
            updated = [...selectedIds, id]; // add id
        }
        onChange(updated);
    };

    return (
        <Stack spacing={1}>
            <Typography variant="subtitle1">Team Members</Typography>

            <TextField
                placeholder="Search members by name..."
                value={query}
                onChange={handleSearch}
                fullWidth
            />

            <List dense sx={{ maxHeight: 200, overflowY: "auto" }}>
                {filtered.map((u) => (
                    <ListItem key={u._id} button onClick={() => handleToggle(u._id)}>
                        <Checkbox
                            checked={selectedIds.includes(u._id)}
                            tabIndex={-1}
                            disableRipple
                            disabled={String(u._id) === String(user?._id)}
                        />
                        <ListItemText primary={u.name} secondary={u.email} />
                    </ListItem>
                ))}
            </List>

            {selectedIds.length > 0 && (
                <Stack direction="row" spacing={1} flexWrap="wrap">
                    {selectedIds.map((id) => {
                        const u = users.find((x) => x._id === id) || { _id: id, name: "Unknown" };
                        const isCurrentUser = String(id) === String(user?._id);
                        return (
                            <Chip
                                key={id}
                                label={isCurrentUser ? `${u.name} (You)` : u.name}
                                onDelete={isCurrentUser ? undefined : () => handleToggle(id)}
                                size="small"
                            />
                        );
                    })}
                </Stack>
            )}
        </Stack>
    );
};

export default MemberSearchPicker;
