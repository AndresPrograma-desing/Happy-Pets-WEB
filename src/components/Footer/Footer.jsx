import React from "react";

export default function Footer({textFooter}) {
    return (
        <footer style={{ textAlign: "center", padding: "1rem", backgroundColor: "var(--letter-white, #ffffff)" }}>
            <p>{textFooter || ` ${new Date().getFullYear()} Sistema de optimización de trabajo happy Pets.`}</p>
        </footer>
    );
}
