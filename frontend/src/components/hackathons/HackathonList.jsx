import React from "react";
import HackathonItem from "./HackathonItem";

const HackathonList = ({ hackathons, onEdit, onDelete }) => {
    return (
        <>
            {hackathons.map((hackathon) => (
                <HackathonItem
                    key={hackathon._id}
                    hackathon={hackathon}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </>
    );
};

export default HackathonList;
