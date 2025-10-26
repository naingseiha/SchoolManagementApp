import React from 'react';
import PropTypes from 'prop-types';

const Modal = ({ isOpen, onClose, title, size, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
            <div className={`bg-white rounded-lg shadow-lg p-6 ${size === 'sm' ? 'w-1/4' : size === 'md' ? 'w-1/2' : size === 'lg' ? 'w-3/4' : 'w-full'}`}> 
                <h2 className="text-lg font-bold mb-4">{title}</h2>
                <button onClick={onClose} className="absolute top-2 right-2">Close</button>
                {children}
            </div>
        </div>
    );
};

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
    children: PropTypes.node,
};

Modal.defaultProps = {
    size: 'md',
};

export default Modal;