import * as signalR from "@microsoft/signalr";
import { DEV_URL_API } from '../../../config/config';

class NotificationSignalRService {
    constructor() {
        this.connection = null;
    }

    /**
     * Inicia la conexión con el Hub de notificaciones.
     * @param {number|string} userId El ID del usuario autenticado.
     * @param {string} baseUrl URL base del backend.
     */
    startConnection(userId, baseUrl = DEV_URL_API.baseURL) {
        if (!userId) {
            return;
        }

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(`${baseUrl}/hubs/notificaciones?userId=${userId}`, {
                headers: {
                    "X-Tunnel-Skip-AntiPhishing-Page": "true",
                    "ngrok-skip-browser-warning": "true"
                }
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        this.connection.start()
            .then(() => {
                console.log("SignalR: Conectado exitosamente al Hub de Notificaciones.");
            })
            .catch((err) => {
                console.error("SignalR: Error al iniciar la conexión:", err);
            });
    }

    /**
     * Suscribe un callback para cuando se reciba una notificación push.
     * @param {function} callback Función que recibe (data) -> { alertId, message }
     */
    onReceiveNotification(callback) {
        if (this.connection) {
            this.connection.on("ReceiveAlertUpdate", (data) => {
                // Como unificamos al mismo DTO, mapeamos directamente las propiedades en camelCase
                callback({
                    alertId: data.alertId || null,
                    message: data.message || "Nueva notificación",
                    title: data.title || "Notificación",
                    type: data.type || "Info"
                });
            });
        }
    }

    /**
     * Quita la suscripción del evento para evitar memory leaks.
     */
    offReceiveNotification() {
        if (this.connection) {
            this.connection.off("ReceiveAlertUpdate");
        }
    }

    /**
     * Invoca el evento manual para disparar una notificación.
     * @param {number} alertId ID de la alerta
     */
    sendPushNotification(alertId) {
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            this.connection.invoke("SendPushNotification", alertId)
                .catch(err => console.error("Error enviando push: ", err));
        } else {
        }
    }

    /**
     * Desconecta el websocket.
     */
    stopConnection() {
        if (this.connection) {
            this.connection.stop();
            this.connection = null;
        }
    }
}

const notificationSignalRService = new NotificationSignalRService();
export default notificationSignalRService;
