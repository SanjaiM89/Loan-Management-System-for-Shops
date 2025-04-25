import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  isGlass?: boolean;
}

const Card = ({ children, title, className = '', isGlass = false }: CardProps) => {
  const baseClass = isGlass ? 'card-glass' : 'card';
  
  return (
    <div className={`${baseClass} p-4 md:p-6 ${className}`}>
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      {children}
    </div>
  );
};

export default Card;