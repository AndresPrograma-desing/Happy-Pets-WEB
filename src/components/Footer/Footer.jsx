import React from "react";

export default function Footer({textFooter}) {
    return (
        <footer style={{ textAlign: "center", padding: "1rem", backgroundColor: " var(--bg-marron-gueso)" }}>
            <p>{textFooter || ` ${new Date().getFullYear()} Sistema de optimización de trabajo happy Pets.`}</p>
        </footer>
    );
}
