import { useEffect, useRef } from 'react';
import styles from './ConfirmModal.module.css';

const ConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Xác nhận", 
    message = "Bạn có chắc chắn muốn thực hiện hành động này?",
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    type = "warning" // warning, danger, info
}) => {
    const confirmRef = useRef(null);

    useEffect(() => {
        // prevent background scrolling while modal is open
        const originalOverflow = document.body.style.overflow;
        if (isOpen) document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = originalOverflow; };
    }, [isOpen]);

    useEffect(() => {
        // focus confirm button for keyboard users when modal opens
        if (isOpen && confirmRef.current) confirmRef.current.focus();
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const getIcon = () => {
        switch (type) {
            case 'danger':
                return (
                    <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                    </svg>
                );
            case 'info':
                return (
                    <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                    </svg>
                );
            default: // warning
                return (
                    <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                    </svg>
                );
        }
    };

    return (
        <div className={styles.overlay} onClick={handleBackdropClick}>
            <div className={styles.modal}>
                <div className={`${styles.iconContainer} ${styles[type]}`}>
                    {getIcon()}
                </div>
                
                <div className={styles.content}>
                    <h3 className={styles.title}>{title}</h3>
                    <p className={styles.message}>{message}</p>
                </div>
                
                <div className={styles.actions} role="group" aria-label="Xác nhận hành động">
                    <button 
                        className={styles.cancelButton}
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>
                    <button 
                        ref={confirmRef}
                        className={`${styles.confirmButton} ${styles[type]}`}
                        onClick={handleConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
