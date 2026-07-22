import * as signalR from "@microsoft/signalr";
import { DEV_URL_API } from '../../../config/config';

class NotificationSignalRService {
    constructor() {
        this.connection = null;
        this.startPromise = null;
        this.stopPromise = null;
        this.currentUserId = null;
        this.listeners = new Set();
    }

    /**
     * Inicia la conexión con el Hub de notificaciones.
     * @param {number|string} userId El ID del usuario autenticado.
     * @param {string} baseUrl URL base del backend.
     */
    async startConnection(userId, baseUrl = DEV_URL_API.baseURL) {
        if (!userId) {
            return;
        }

        // Si cambió de usuario, cerramos la conexión anterior
        if (this.currentUserId && String(this.currentUserId) !== String(userId)) {
            await this.stopConnection();
        }

        this.currentUserId = userId;

        // Si se está deteniendo la conexión, esperamos a que termine
        if (this.stopPromise) {
            try {
                await this.stopPromise;
            } catch (err) {
                // Ignorar error al detener conexión previa
            }
        }

        // Si ya está conectada, conectándose o reconectándose, no volver a iniciar
        if (this.connection) {
            const state = this.connection.state;
            if (state === signalR.HubConnectionState.Connected ||
                state === signalR.HubConnectionState.Connecting ||
                state === signalR.HubConnectionState.Reconnecting) {
                return;
            }
        }

        // Crear la conexión de SignalR si no existe
        if (!this.connection) {
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl(`${baseUrl}/hubs/notificaciones?userId=${userId}`, {
                    headers: {
                        "X-Tunnel-Skip-AntiPhishing-Page": "true",
                        "ngrok-skip-browser-warning": "true"
                    }
                })
                .withAutomaticReconnect()
                .configureLogging(signalR.LogLevel.Warning)
                .build();

            // Suscripción interna persistente a eventos de backend
            this.connection.on("ReceiveAlertUpdate", (data) => {
                const formatted = {
                    alertId: data?.alertId || data?.id || null,
                    message: data?.message || "Nueva notificación",
                    title: data?.title || "Notificación",
                    type: data?.type || "Info"
                };
                this.listeners.forEach((callback) => {
                    try {
                        callback(formatted);
                    } catch (err) {
                        console.error("Error en listener de notificación SignalR:", err);
                    }
                });
            });
        }

        // Iniciar la conexión si está desconectada
        if (this.connection.state === signalR.HubConnectionState.Disconnected) {
            this.startPromise = this.connection.start()
                .then(() => {
                    console.log("SignalR: Conectado exitosamente al Hub de Notificaciones.");
                    this.startPromise = null;
                })
                .catch((err) => {
                    console.error("SignalR: Error al iniciar la conexión:", err);
                    this.startPromise = null;
                    this.connection = null;
                });
            await this.startPromise;
        }
    }

    /**
     * Suscribe un callback para recibir alertas.
     * @param {function} callback
     */
    onReceiveNotification(callback) {
        if (typeof callback === 'function') {
            this.listeners.add(callback);
        }
    }

    /**
     * Remueve la suscripción de un callback.
     * @param {function} callback
     */
    offReceiveNotification(callback) {
        if (typeof callback === 'function') {
            this.listeners.delete(callback);
        } else {
            this.listeners.clear();
        }
    }

    /**
     * Detiene la conexión WebSocket (solo en logout o cambio de usuario).
     */
    async stopConnection() {
        if (this.startPromise) {
            try {
                await this.startPromise;
            } catch (err) {}
        }

        if (this.connection && this.connection.state !== signalR.HubConnectionState.Disconnected) {
            this.stopPromise = this.connection.stop()
                .then(() => {
                    console.log("SignalR: Conexión detenida exitosamente.");
                    this.connection = null;
                    this.currentUserId = null;
                    this.stopPromise = null;
                    this.listeners.clear();
                })
                .catch((err) => {
                    console.error("SignalR: Error al detener la conexión:", err);
                    this.connection = null;
                    this.currentUserId = null;
                    this.stopPromise = null;
                    this.listeners.clear();
                });
            await this.stopPromise;
        } else {
            this.connection = null;
            this.currentUserId = null;
            this.listeners.clear();
        }
    }
}

const notificationSignalRService = new NotificationSignalRService();
export default notificationSignalRService;
