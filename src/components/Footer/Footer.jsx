import React from "react";

export default function Footer({textFooter}) {
    return (
        <footer style={{ textAlign: "center", padding: "1rem", backgroundColor: "#f0f0f0" }}>
            <p>{textFooter || `&copy; ${new Date().getFullYear()} happy Pets. Todos los derechos reservados.`}</p>
        </footer>
    );
}
