import { XMarkIcon } from '@heroicons/react/24/outline';
import type { ReactNode } from 'react';

interface AlertProps {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string | ReactNode;
    onDismiss?: () => void;
}

const Alert = ({ type, message, onDismiss }: AlertProps) => {
    // Define as cores e o ícone com base no tipo
    const getAlertClasses = () => {
        switch (type) {
            case 'success':
                return 'bg-green-100 border-green-500 text-green-700';
            case 'error':
                return 'bg-red-100 border-red-500 text-red-700';
            case 'warning':
                return 'bg-yellow-100 border-yellow-500 text-yellow-700';
            case 'info':
                return 'bg-blue-100 border-blue-500 text-blue-700';
            default:
                return 'bg-gray-100 border-gray-500 text-gray-700';
        }
    };

    return (
        <div className={`border-l-4 p-4 mb-4 rounded ${getAlertClasses()}`} role="alert">
            <div className="flex items-start">
                <div className="flex-grow">
                    {typeof message === 'string' ? <p>{message}</p> : message}
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex items-center justify-center h-8 w-8"
                        aria-label="Fechar"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Alert;
