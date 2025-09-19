// components/ui/SophisticatedSpinner.tsx

import React from "react";

interface spinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "white";
  className?: string;
}

const MySpinner: React.FC<spinnerProps> = ({
  size = "md",
  color = "primary",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const colorClasses = {
    primary: "text-blue-600",
    secondary: "text-gray-600",
    white: "text-white",
  };

  return (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}>
      <svg
        className="animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 8l3-3.709z"
        />
      </svg>
    </div>
  );
};

// Spinner avec effet de pulsation
export const PulsingSpinner: React.FC<spinnerProps> = ({
  size = "md",
  color = "primary",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const colorClasses = {
    primary: "bg-blue-600",
    secondary: "bg-gray-600",
    white: "bg-white",
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div
        className={`${colorClasses[color]} rounded-full animate-pulse`}
        style={{
          animation: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
      />
    </div>
  );
};

// Spinner avec effet de vague
export const WaveSpinner: React.FC<spinnerProps> = ({
  size = "md",
  color = "primary",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const colorClasses = {
    primary: "bg-blue-600",
    secondary: "bg-gray-600",
    white: "bg-white",
  };

  return (
    <div className={`${sizeClasses[size]} ${className} flex space-x-1`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${colorClasses[color]} rounded-full`}
          style={{
            width: "4px",
            height: "4px",
            animation: `wave 1.4s ease-in-out infinite both`,
            animationDelay: `${i * 0.16}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes wave {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

// Spinner avec effet de rotation et gradient
export const GradientSpinner: React.FC<spinnerProps> = ({
  size = "md",
  color = "primary",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div
        className="w-full h-full rounded-full border-2 border-transparent"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${
            color === "primary" ? "#3b82f6" : color === "secondary" ? "#6b7280" : "#ffffff"
          }, transparent)`,
          animation: "spin 1s linear infinite",
        }}
      />
    </div>
  );
};

export default MySpinner;
