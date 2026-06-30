export const parseEmailTemplate = (htmlCode, data) => {
    let parsedHtml = htmlCode;
    for (const key in data) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        parsedHtml = parsedHtml.replace(regex, data[key]);
    }
    return parsedHtml;
};

export const sampleData = {
    system_name: "HappyPets",
    client_name: "Juan Pérez",
    pet_name: "Firulais",
    factura_numero: "F-2026-001",
    fecha_emision: new Date().toLocaleDateString('es-ES')
};
