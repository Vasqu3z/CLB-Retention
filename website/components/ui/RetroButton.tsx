"use client";

import React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";

interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  children: React.ReactNode;
  isLoading?: boolean;
}

export function RetroButton({ 
  variant = "primary", 
  size = "md",
  href, 
  className, 
  children,
  isLoading,
  disabled,
  ...props 
}: RetroButtonProps) {
  
  const baseStyles = "group relative font-display uppercase tracking-wide overflow-hidden transition-all duration-200 rounded-sm inline-flex items-center justify-center cursor-pointer select-none focus-arcade";
  
  const variants = {
    primary: "bg-comets-yellow text-black hover:brightness-110 active:brightness-90",
    outline: "border-2 border-white/20 text-white hover:bg-white/5 hover:border-white/50 backdrop-blur-sm",
    ghost: "text-white hover:bg-white/10"
  };

  const sizes = {
    sm: "px-6 py-2 text-base",
    md: "px-8 py-4 text-xl",
    lg: "px-12 py-6 text-2xl"
  };

  const disabledStyles = "opacity-50 cursor-not-allowed pointer-events-none";

  const content = (
    <>
      <span className="relative z-10 flex items-center gap-2">
        {isLoading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
            />
            Loading...
          </>
        ) : children}
      </span>
      
      {/* Primary variant shimmer effect */}
      {variant === "primary" && !disabled && !isLoading && (
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
      )}
      
      {/* Outline variant scan effect */}
      {variant === "outline" && !disabled && !isLoading && (
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-comets-cyan/0 via-comets-cyan/20 to-comets-cyan/0"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      )}
    </>
  );

  const buttonClasses = cn(
    baseStyles, 
    variants[variant], 
    sizes[size],
    disabled || isLoading ? disabledStyles : "arcade-press",
    className
  );

  if (href && !disabled && !isLoading) {
    return (
      <Link href={href} className={buttonClasses}>
        {content}
      </Link>
    );
  }

  return (
    <motion.button 
      className={buttonClasses} 
      disabled={disabled || isLoading}
      whileHover={!disabled && !isLoading ? { scale: 1.05 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.95 } : {}}
      {...props}
    >
      {content}
    </motion.button>
  );
}

export default RetroButton;
