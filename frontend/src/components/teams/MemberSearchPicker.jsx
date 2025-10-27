// src/components/hackathons/MemberSearchPicker.jsx
import React, { useEffect, useMemo, useState } from "react";
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

const MemberSearchPicker = ({ users, selectedIds = [], onChange }) => {
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
        let updated;
        if (selectedIds.includes(id)) {
            updated = selectedIds.filter((sid) => sid !== id); // ✅ remove id
        } else {
            updated = [...selectedIds, id]; // ✅ add id
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
                {filtered.map((user) => (
                    <ListItem key={user._id} button onClick={() => handleToggle(user._id)}>
                        <Checkbox
                            checked={selectedIds.includes(user._id)}
                            tabIndex={-1}
                            disableRipple
                        />
                        <ListItemText primary={user.name} secondary={user.email} />
                    </ListItem>
                ))}
            </List>

            {selectedIds.length > 0 && (
                <Stack direction="row" spacing={1} flexWrap="wrap">
                    {selectedIds.map((id) => {
                        const u = users.find((x) => x._id === id);
                        return (
                            <Chip
                                key={id}
                                label={u?.name || "Unknown"}
                                onDelete={() => handleToggle(id)}
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
