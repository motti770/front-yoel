import { X } from 'lucide-react';
import './Modal.css';

function Modal({ isOpen, onClose, title, children, size = 'medium', hideHeader = false }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className={`modal-content ${size}`}
                onClick={(e) => e.stopPropagation()}
            >
                {!hideHeader && (
                    <div className="modal-header">
                        <h2>{title}</h2>
                        <button className="modal-close" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                )}
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Modal;
