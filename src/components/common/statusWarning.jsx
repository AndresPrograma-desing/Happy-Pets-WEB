import React from "react";
// import { useNavigate } from "react-router-dom";
import { StatusUser } from "../../services/api";
import { AlertCircle, Lock } from "lucide-react";
// import style from "./StatusWarning.module.css";

const StatusModal = ({ userId }) => {
//   const [isBlocked, setIsBlocked] = React.useState(false);
//   const [loading, setLoading] = React.useState(true);


  // React.useEffect(() => {
  //   const checkUserStatus = async () => {
  //     if (!userId) return;
      
  //     try {
  //       const response = await StatusUser(userId);
  //       if (response.status === "disabled") {
  //         setIsBlocked(true);
  //       } else {
  //         setIsBlocked(false);
  //       }
  //     } catch (error) {
  //       console.error("Error validando estado:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   checkUserStatus();
  // }, [userId]);

  // if (loading) return null ; 
  // if (!isBlocked) return null ;

  // return (
  //   <div className={style.modalOverlay}>
  //     <div className={style.modalContent}>
  //       <Lock size={48} color="#e74c3c" />
  //       <h2>Cuenta Bloqueada</h2>
  //       <p>Tu usuario se encuentra deado en el sistema.</p>
  //       <p>Por favor, contacta al administrador para más información.</p>
  //       <button onClick={() => navigate("/login")} className={style.btn}>
  //         Volver al Login
  //       </button>
  //     </div>
  //   </div>
  // );
// };
}
export default StatusModal;