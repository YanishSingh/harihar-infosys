import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  relative?: boolean; // Optional, always true by default
}

export function Card({
  children,
  className = "",
  relative = true,
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl p-6 shadow-card border border-gray-light ${
        relative ? "relative" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
