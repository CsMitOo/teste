import React from 'react';

interface LoaderProps {
    message?: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
    return (
        <div className="flex flex-col items-center justify-center bg-transparent rounded-lg p-10 min-h-[300px]">
            <div className="w-16 h-16 border-4 border-t-purple-600 border-r-purple-600 border-b-gray-200 border-l-gray-200 rounded-full animate-spin"></div>
            {message && <p className="mt-6 text-lg text-gray-600 text-center max-w-sm">{message}</p>}
        </div>
    );
};

export default Loader;