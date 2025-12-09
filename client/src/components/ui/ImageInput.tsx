import { ReactNode } from "react";
import { Camera } from "lucide-react";

interface ImageInputProps {
  imageUrl?: string;
  placeholder?: string;
  onClick: () => void;
  children?: ReactNode;
  className?: string;
  imageClassName?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: {
    container: "w-16 h-16 rounded-lg",
    icon: 32,
  },
  md: {
    container: "w-24 h-24 rounded-xl",
    icon: 40,
  },
  lg: {
    container: "w-full aspect-video rounded-xl",
    icon: 48,
  },
};

export function ImageInput({
  imageUrl,
  placeholder = "Clique para adicionar",
  onClick,
  children,
  className = "",
  imageClassName = "w-full h-full object-cover",
  showIcon = true,
  size = "md",
}: ImageInputProps) {
  const sizeConfig = sizeStyles[size];

  return (
    <div
      onClick={onClick}
      className={`relative group cursor-pointer overflow-hidden bg-zinc-800 border border-zinc-700 transition-all hover:border-violet-500 flex items-center justify-center ${sizeConfig.container} ${className}`}
    >
      {imageUrl ? (
        <>
          <img src={imageUrl} alt="Preview" className={imageClassName} />
          {showIcon && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <Camera
                size={sizeConfig.icon}
                className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full text-center p-4 group-hover:bg-zinc-700/50 transition-colors">
          {showIcon && (
            <Camera size={sizeConfig.icon} className="text-zinc-500 mb-2 group-hover:text-zinc-400 transition-colors" />
          )}
          <p className="text-xs font-bold text-zinc-500 group-hover:text-zinc-400 transition-colors">
            {placeholder}
          </p>
        </div>
      )}
      {children}
    </div>
  );
}
