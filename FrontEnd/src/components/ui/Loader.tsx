interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Loader = ({ size = 'medium', className = '' }: LoaderProps) => {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4'
  };
  
  return (
    <div className={`${className} flex justify-center items-center`}>
      <div 
        className={`${sizeClasses[size]} rounded-full border-t-primary-500 border-r-primary-300 border-b-primary-200 border-l-primary-100 animate-spin`}
      ></div>
    </div>
  );
};

export default Loader;