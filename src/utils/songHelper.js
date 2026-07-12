import notifsoftenter from '../assets/song/notif-soft-enter.mpeg';

const soungs = {
    login: new Audio(notifsoftenter)
};

/**
 * @param {string} soungName - Nombre del sonido a reproducir (debe existir en el objeto `soungs`)
 * @param {number} volume - Volumen de reproducción (0 a 1)
*/

export const playSoung = (soungName, volumen = 1) => {
   try {
    const audio = soungs[soungName];
    if(audio){
        audio.currentTime = 0;

        audio.volume = volumen;
        audio.play().catch(err => console.log('Error al reproducir sonido:', err));

    } else {
        console.warn(`El sonido "${soungName}" no existe en el objeto de sonidos.`);

    }}catch(err){
        console.error('Error al reproducir sonido:', err);
    }
}

// Wrapper compatible: llamada específica usada por componentes
export const playLoginSound = (volumen = 0) => playSoung('login', volumen);
