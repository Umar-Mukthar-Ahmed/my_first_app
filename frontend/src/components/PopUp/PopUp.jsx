import styles from "./PopUp.module.css";

function Popup({ message, onClose }) {
    return (
        <div className={styles.popupOverlay}>
            <div className={styles.popup}>
                <p>{message}</p>
                <button onClick={onClose} className={styles.closeButton}>
                    Close
                </button>
            </div>
        </div>
    );
}

export default Popup;