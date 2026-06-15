"use client";

import { cloneElement, isValidElement } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

const variants = {
  primary:
    "text-white font-semibold transition-shadow",
  secondary:
    "glass-sm text-text font-medium hover:bg-white/[0.065] border border-white/[0.09] transition-all",
  ghost:
    "text-muted hover:text-text font-medium transition-colors",
  danger:
    "border text-red-400 font-medium transition-colors",
};

const sizes = {
  sm: "px-4 py-2 text-sm rounded-xl",
  md: "px-6 py-3 text-base rounded-2xl",
  lg: "px-8 py-4 text-[1.0625rem] rounded-2xl",
};

const primaryStyle = {
  background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
  boxShadow: "0 0 28px rgba(139,92,246,0.28)",
};

const dangerStyle = {
  background: "rgba(239,68,68,0.14)",
  border: "1px solid rgba(239,68,68,0.28)",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  disabled,
  loading,
  style,
  asChild,
  ...props
}) {
  const inlineStyle =
    variant === "primary" && !disabled && !loading ? primaryStyle :
    variant === "danger" ? dangerStyle :
    undefined;

  const classes = clsx(
    "inline-flex items-center justify-center gap-2 cursor-pointer select-none",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    variants[variant],
    sizes[size],
    className
  );

  // Render the child element directly (e.g. a <Link>) with our styles merged.
  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      className: clsx(classes, children.props.className),
      style: { ...inlineStyle, ...style, ...children.props.style },
      ...props,
    });
  }

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.025 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
      disabled={disabled || loading}
      style={{ ...inlineStyle, ...style }}
      className={classes}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </motion.button>
  );
}
