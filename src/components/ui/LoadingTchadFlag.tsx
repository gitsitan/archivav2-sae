import React from "react";

const LoadingTchadFlag: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-96 gap-4 animate-pulse">
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/4/4b/Flag_of_Chad.svg"
        alt="Drapeau du Tchad"
        className="w-24 h-auto rounded shadow-lg"
      />
      <p className="text-center text-lg text-gray-700 dark:text-gray-300 font-semibold">
        Chargement en cours...
      </p>
    </div>
  );
};

export default LoadingTchadFlag;
