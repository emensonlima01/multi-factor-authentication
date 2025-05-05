import type { ReactNode } from 'react';

interface CardProps {
    title?: string;
    children: ReactNode;
    className?: string;
}

const Card = ({ title, children, className = '' }: CardProps) => {
    return (
        <div className={`bg-white shadow-md rounded px-4 sm:px-6 md:px-8 pt-6 pb-8 mb-4 w-full ${className}`}>
            {title && <h2 className="text-xl font-bold mb-4 text-gray-800">{title}</h2>}
            {children}
        </div>
    );
};

export default Card;
