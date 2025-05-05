import type { ReactNode } from 'react';

interface CardProps {
    title?: string;
    children: ReactNode;
    className?: string;
}

const Card = ({ title, children, className = '' }: CardProps) => {
    return (
        <div className={`bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 ${className}`}>
            {title && <h2 className="text-xl font-bold mb-4 text-gray-800">{title}</h2>}
            {children}
        </div>
    );
};

export default Card;
