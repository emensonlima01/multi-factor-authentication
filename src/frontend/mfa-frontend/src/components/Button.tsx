import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    fullWidth?: boolean;
}

const Button = ({
    children,
    className = '',
    variant = 'primary',
    fullWidth = false,
    ...props
}: ButtonProps) => {
    // Define as classes do botão com base na variante
    const getVariantClasses = () => {
        switch (variant) {
            case 'primary':
                return 'bg-blue-500 hover:bg-blue-700 text-white';
            case 'secondary':
                return 'bg-gray-300 hover:bg-gray-400 text-gray-800';
            case 'danger':
                return 'bg-red-500 hover:bg-red-700 text-white';
            case 'success':
                return 'bg-green-500 hover:bg-green-700 text-white';
            default:
                return 'bg-blue-500 hover:bg-blue-700 text-white';
        }
    };

    // Combina todas as classes
    const buttonClasses = `
    ${getVariantClasses()}
    font-bold py-2 px-4 rounded
    focus:outline-none focus:shadow-outline
    transition-colors duration-200
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

    return (
        <button className={buttonClasses} {...props}>
            {children}
        </button>
    );
};

export default Button;
