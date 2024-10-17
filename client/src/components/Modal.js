import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { MdClose } from 'react-icons/md';
import { useEffect } from 'react';

const Modal = ({ target, title, size, show, onHide, children }) => {
    useEffect(() => {
        const modalElement = document.getElementById(target);
        const bootstrapModal = new window.bootstrap.Modal(modalElement);

        if (show) {
            bootstrapModal.show();
        } else {
            bootstrapModal.hide();
        }

        return () => {
            bootstrapModal.dispose();
        };
    }, [show, target]);

    // Manually remove `modal-open` and backdrop on close to ensure scroll is restored
    const handleOnHide = () => {
        document.body.classList.remove('modal-open'); // Ensure modal-open is removed
        const modalBackdrop = document.querySelector('.modal-backdrop');
        if (modalBackdrop) {
            modalBackdrop.remove(); // Ensure the backdrop is removed
        }
        onHide(); // Call the onHide callback to update the modal state
    };

    return (
        <div className="modal fade" id={target} tabIndex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
            <div className={`modal-dialog modal-dialog-scrollable ${size}`}>
                <div className="modal-content">
                    <div className="modal-header bg-primary">
                        <h5 className="modal-title">{title}</h5>
                        <button 
                            type="button" 
                            className="btn-close text-white" 
                            data-bs-dismiss="modal" 
                            aria-label="Close"
                            onClick={handleOnHide}  // Ensure cleanup when closing
                        >
                            <MdClose className="icon-small" />
                        </button>
                    </div>
                    <div className="modal-body">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
