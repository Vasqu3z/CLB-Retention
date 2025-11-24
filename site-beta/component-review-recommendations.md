# Comets League Component Review & Improvement Recommendations

## Executive Summary
Your component library has solid architecture but needs arcade polish. Key themes:
- Add motion-first interactions (spring physics, power-up animations)
- Improve contrast/readability (especially mobile)
- Add keyboard accessibility throughout
- Enhance tactile feedback (active states, haptic-feeling animations)
- Cosmic/diegetic elements need to be threaded through

---

## 🎨 GLOBAL FOUNDATIONS

### `Globals.css` - **Priority: HIGH**

**Current State:** Basic setup with scanlines utility
**Issues:**
- Missing key animation definitions
- No focus state utilities
- Limited neon glow effects
- Scrollbar styling could be more arcade

**Recommended Additions:**

```css
/* ADD THESE ANIMATIONS */
@layer utilities {
  /* Power-up pulse for active elements */
  @keyframes powerUp {
    0% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.3); opacity: 1; }
    100% { transform: scale(1); opacity: 0.5; }
  }
  
  .power-indicator {
    animation: powerUp 2s ease-in-out infinite;
  }

  /* Spring bounce entrance */
  @keyframes springBounce {
    0% { transform: scale(0.8); opacity: 0; }
    60% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }
  
  .spring-in {
    animation: springBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  /* Stat bar fill animation */
  @keyframes fillBar {
    from { width: 0; }
  }
  
  .stat-fill {
    animation: fillBar 1.5s ease-out forwards;
  }

  /* Arcade button press feedback */
  .arcade-press {
    transition: all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  .arcade-press:hover {
    transform: translateY(-2px) scale(1.02);
  }
  
  .arcade-press:active {
    transform: translateY(1px) scale(0.98);
    opacity: 0.9;
  }

  /* Enhanced glow effects */
  .glow-cyan-strong {
    text-shadow: 0 0 10px var(--comets-cyan), 0 0 20px var(--comets-cyan), 0 0 30px var(--comets-cyan);
  }
  
  .glow-yellow-strong {
    text-shadow: 0 0 10px var(--comets-yellow), 0 0 20px var(--comets-yellow);
  }

  .box-glow-cyan {
    box-shadow: 0 0 20px rgba(0, 243, 255, 0.3), inset 0 0 20px rgba(0, 243, 255, 0.1);
  }

  /* Focus states for accessibility */
  .focus-arcade:focus-visible {
    outline: 2px solid var(--comets-cyan);
    outline-offset: 4px;
    box-shadow: 0 0 0 4px rgba(0, 243, 255, 0.2);
  }
}

/* Improve scrollbar */
::-webkit-scrollbar { 
  width: 10px; 
  height: 10px; 
}
::-webkit-scrollbar-track { 
  background: var(--background); 
  border-left: 1px solid rgba(255,255,255,0.1);
}
::-webkit-scrollbar-thumb { 
  background: linear-gradient(180deg, var(--comets-cyan), var(--comets-blue));
  border-radius: 4px; 
}
::-webkit-scrollbar-thumb:hover { 
  background: var(--comets-yellow);
  box-shadow: 0 0 10px var(--comets-yellow);
}
```

---

## 🧩 CORE UI COMPONENTS

### `RetroButton.tsx` - **Priority: HIGH** ⭐

**Current State:** Solid foundation with variants
**Strengths:** Good variant system, Link integration
**Issues:**
- Missing active state feedback
- No haptic-style press animation
- Could use loading state
- Missing disabled state styling

**Recommended Improvements:**

```tsx
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
    primary: "bg-comets-yellow text-black hover:scale-105 active:scale-95 active:brightness-90",
    outline: "border-2 border-white/20 text-white hover:bg-white/5 hover:border-white/50 backdrop-blur-sm active:scale-95",
    ghost: "text-white hover:bg-white/10 active:scale-95"
  };

  const sizes = {
    sm: "px-6 py-2 text-base",
    md: "px-8 py-4 text-xl",
    lg: "px-12 py-6 text-2xl"
  };

  const disabledStyles = "opacity-50 cursor-not-allowed hover:scale-100 active:scale-100";

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
      {variant === "primary" && !disabled && (
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
      )}
      {variant === "outline" && !disabled && (
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-comets-cyan/0 via-comets-cyan/10 to-comets-cyan/0"
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
    disabled || isLoading ? disabledStyles : "",
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
    <button 
      className={buttonClasses} 
      disabled={disabled || isLoading}
      {...props}
    >
      {content}
    </button>
  );
}

export default RetroButton;
```

**Key Additions:**
- Loading state with spinner
- Disabled state handling
- Size variants
- Ghost variant for subtle CTAs
- Shimmer effect on outline variant
- Better active state with `active:scale-95`

---

### `RetroCard.tsx` - **Priority: MEDIUM**

**Current State:** Clean, functional
**Strengths:** Good use of Framer Motion, nice hover effects
**Issues:**
- No active state
- Arrow icon doesn't have spring physics
- Could use more dramatic hover transform
- Missing keyboard interaction feedback

**Recommended Improvements:**

```tsx
// In the motion.div, add whileTap:
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  whileTap={{ scale: 0.98 }} // ADD THIS
  viewport={{ once: true }}
  transition={{ delay: delay, duration: 0.5 }}
  className="relative h-full min-h-[240px] p-8 bg-surface-dark border border-white/5 hover:border-white/20 transition-colors duration-300 overflow-hidden rounded-xl cursor-pointer focus-arcade"
  tabIndex={0} // ADD keyboard support
  role="button"
  onKeyDown={(e) => { // ADD keyboard handler
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.location.href = href;
    }
  }}
>

// Enhance the arrow with spring physics:
<motion.div
  animate={{ x: [0, 5, 0] }}
  transition={{ 
    duration: 1.5, 
    repeat: Infinity, 
    ease: "easeInOut" 
  }}
>
  <ArrowRight className="text-white/20 group-hover:text-comets-cyan transition-colors duration-300" />
</motion.div>
```

---

### `RetroTable.tsx` - **Priority: MEDIUM**

**Current State:** Functional and styled
**Strengths:** Good loading state, hover effects
**Issues:**
- Row animations could be more dramatic
- No keyboard navigation between rows
- Missing sort indicators for headers
- Could use pagination component

**Recommended Improvements:**

```tsx
// Enhance row animation:
<motion.tr 
  key={item.id || i}
  initial={{ opacity: 0, x: -20 }} // Increase from -10
  whileInView={{ opacity: 1, x: 0 }}
  whileHover={{ x: 4 }} // Add subtle shift on hover
  transition={{ 
    delay: i * 0.03, // Reduce delay for snappier feel
    duration: 0.3,
    type: "spring",
    stiffness: 300
  }}
  onClick={() => onRowClick && onRowClick(item)}
  onKeyDown={(e) => {
    if ((e.key === 'Enter' || e.key === ' ') && onRowClick) {
      e.preventDefault();
      onRowClick(item);
    }
  }}
  tabIndex={onRowClick ? 0 : -1}
  className={cn(
    "border-b border-white/5 hover:bg-white/5 transition-all duration-200 group/row relative focus-arcade",
    onRowClick && "cursor-pointer"
  )}
>

// Add sortable header example:
interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T, index: number) => React.ReactNode;
  className?: string;
  sortable?: boolean; // ADD THIS
}

// In header rendering:
<th 
  key={i} 
  className={cn(
    "p-4 font-ui uppercase text-sm tracking-[0.15em] text-comets-yellow/80 font-bold whitespace-nowrap relative z-10",
    col.sortable && "cursor-pointer hover:text-comets-yellow transition-colors",
    col.className
  )}
  onClick={() => col.sortable && handleSort(col.accessorKey)}
>
  <div className="flex items-center gap-2">
    {col.header}
    {col.sortable && (
      <svg width="12" height="12" fill="currentColor" className="opacity-50">
        <path d="M6 3L9 6H3L6 3ZM6 9L3 6H9L6 9Z"/>
      </svg>
    )}
  </div>
</th>
```

---

### `RetroLoader.tsx` - **Priority: LOW**

**Current State:** Good, matches theme
**Strengths:** Clean animation, thematic
**Issues:**
- Could be more visually interesting
- Consider adding particle effects

**Recommended Enhancement:**

```tsx
export default function RetroLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 p-12 min-h-[300px] w-full">
      <div className="relative w-16 h-16">
        {/* Main spinner */}
        <motion.div
          animate={{ rotateY: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-full h-full rounded-full border-4 border-comets-yellow bg-black relative overflow-hidden shadow-[0_0_20px_var(--comets-yellow)]"
        >
          <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-full scale-75 opacity-50" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-comets-yellow/20 rounded-full blur-sm" />
        </motion.div>
        
        {/* ADD: Orbiting particles */}
        {[0, 120, 240].map((rotation, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-comets-cyan rounded-full"
            style={{
              top: '50%',
              left: '50%',
              marginTop: -1,
              marginLeft: -1,
            }}
            animate={{
              rotate: rotation,
              x: [0, 30],
            }}
            transition={{
              rotate: { duration: 0, ease: "linear" },
              x: {
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              },
            }}
          />
        ))}
      </div>

      <motion.div
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="flex flex-col items-center text-center"
      >
        <div className="font-display text-2xl text-white tracking-widest">
          LOADING
        </div>
        <div className="text-xs font-mono text-comets-cyan uppercase tracking-[0.5em] mt-2">
          Insert Coin
        </div>
      </motion.div>
    </div>
  );
}
```

---

## 🎮 SPECIALIZED COMPONENTS

### `TeamSelectCard.tsx` - **Priority: HIGH** ⭐

**Current State:** Great foundation
**Strengths:** Good hover effects, nice skeuomorphic design
**Issues:**
- Could use more dramatic scale on hover
- Missing active/pressed state
- Stats could animate on reveal
- Gradient overlay timing could be smoother

**Recommended Improvements:**

```tsx
<Link href={href} className="block h-full group perspective-1000">
  <motion.div
    whileHover={{ scale: 1.05, rotateX: 5 }} // Increase from 1.02
    whileTap={{ scale: 0.98 }} // ADD
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className="relative h-64 bg-surface-dark border border-white/10 rounded-xl overflow-hidden hover:border-white/30 transition-all duration-300 shadow-lg focus-arcade"
    tabIndex={0}
  >
    {/* Enhance background gradient */}
    <motion.div 
      className="absolute inset-0 bg-gradient-to-b from-transparent to-black"
      style={{ background: `linear-gradient(to bottom, ${logoColor}20, transparent)` }}
      initial={{ opacity: 0 }}
      whileHover={{ opacity: 0.3 }} // More visible on hover
      transition={{ duration: 0.5 }}
    />
    
    {/* Animate the logo */}
    <motion.div 
      className="absolute inset-0 flex items-center justify-center z-0 grayscale group-hover:grayscale-0"
      initial={{ opacity: 0.2, scale: 1 }}
      whileHover={{ 
        opacity: 1, 
        scale: 1.15,
        rotate: [0, -5, 5, 0], // ADD subtle rotation
      }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-9xl font-display" style={{ color: logoColor }}>{code[0]}</div>
    </motion.div>

    <div className="absolute inset-0 p-6 flex flex-col justify-between z-10 bg-gradient-to-t from-black/80 to-transparent">
      {/* ... existing content ... */}
      
      {/* Animate stats on hover */}
      <motion.div
        initial={{ y: 0 }}
        whileHover={{ y: -2 }}
      >
        <h3 className="font-display text-2xl text-white leading-none mb-2 group-hover:text-shadow-neon transition-all">
          {name}
        </h3>
        <div className="flex gap-4 text-sm font-mono text-white/60">
          <motion.span whileHover={{ scale: 1.1, color: "white" }}>
            <span className="text-white">W:</span> {stats.wins}
          </motion.span>
          <motion.span whileHover={{ scale: 1.1, color: "white" }}>
            <span className="text-white">L:</span> {stats.losses}
          </motion.span>
          <motion.span 
            className="text-comets-cyan"
            whileHover={{ scale: 1.1 }}
          >
            {stats.avg} AVG
          </motion.span>
        </div>
      </motion.div>
    </div>
    
    {/* Enhance border pulse */}
    <motion.div 
      className="absolute inset-0 border-2 rounded-xl pointer-events-none" 
      style={{ borderColor: logoColor }}
      initial={{ opacity: 0 }}
      whileHover={{ 
        opacity: 0.6,
        scale: [1, 1.02, 1],
      }}
      transition={{ 
        scale: { duration: 1, repeat: Infinity }
      }}
    />
  </motion.div>
</Link>
```

---

### `VersusCard.tsx` - **Priority: HIGH** ⭐

**Current State:** Strong visual concept
**Strengths:** Great split design, good use of team colors
**Issues:**
- Could use more motion on hover
- VS text transition is static
- Score reveal could be more dramatic
- Missing focus states

**Recommended Improvements:**

```tsx
<motion.div 
  className="group relative w-full h-32 bg-surface-dark border border-white/10 rounded-xl overflow-hidden hover:border-white/30 transition-all duration-300 cursor-pointer focus-arcade"
  whileHover={{ scale: 1.02, y: -2 }}
  whileTap={{ scale: 0.99 }}
  transition={{ type: "spring", stiffness: 300 }}
  tabIndex={0}
>
  
  {/* Background Split - Add animation */}
  <div className="absolute inset-0 flex">
    <motion.div 
      className="w-[55%] h-full skew-x-12 -ml-4 opacity-20"
      style={{ backgroundColor: home.logoColor }}
      whileHover={{ width: "60%", opacity: 0.4 }}
      transition={{ duration: 0.5 }}
    />
    <div className="flex-1 h-full bg-black/50" />
    <motion.div 
      className="absolute right-0 top-0 bottom-0 w-[55%] skew-x-12 -mr-4 opacity-20"
      style={{ backgroundColor: away.logoColor }}
      whileHover={{ width: "60%", opacity: 0.4 }}
      transition={{ duration: 0.5 }}
    />
  </div>

  {/* Content Grid */}
  <div className="absolute inset-0 flex items-center justify-between px-8 z-10">
    
    {/* Animate team codes */}
    <motion.div 
      className="flex items-center gap-4 text-left w-1/3"
      whileHover={{ x: -5 }}
    >
      <div className="text-4xl font-display text-white">{home.code}</div>
      <div className="hidden md:block font-ui uppercase tracking-wider text-sm text-white/60">
        {home.name}
      </div>
    </motion.div>

    {/* Center - enhance VS/Score */}
    <div className="flex flex-col items-center justify-center w-1/3">
      {isFinished ? (
        <motion.div 
          className="flex items-center gap-4 font-mono text-3xl font-bold text-white bg-black/50 px-4 py-1 rounded border border-white/10 backdrop-blur-sm"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <motion.span 
            className={home.score! > away.score! ? "text-comets-yellow" : "text-white/50"}
            animate={home.score! > away.score! ? { 
              scale: [1, 1.1, 1],
              textShadow: ["0 0 0px #F4D03F", "0 0 10px #F4D03F", "0 0 0px #F4D03F"]
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {home.score}
          </motion.span>
          <span className="text-sm text-white/20">-</span>
          <motion.span 
            className={away.score! > home.score! ? "text-comets-yellow" : "text-white/50"}
            animate={away.score! > home.score! ? { 
              scale: [1, 1.1, 1],
              textShadow: ["0 0 0px #F4D03F", "0 0 10px #F4D03F", "0 0 0px #F4D03F"]
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {away.score}
          </motion.span>
        </motion.div>
      ) : (
        <motion.div 
          className="font-display text-4xl text-white/10 italic"
          whileHover={{ 
            scale: 1.25, 
            color: "rgba(0, 243, 255, 0.8)",
            rotate: [0, -5, 5, 0]
          }}
          transition={{ duration: 0.3 }}
        >
          VS
        </motion.div>
      )}
      <div className="mt-1 text-[10px] font-mono text-white/40 uppercase tracking-widest">
        {date} • {time}
      </div>
    </div>

    {/* Away team */}
    <motion.div 
      className="flex items-center gap-4 justify-end text-right w-1/3"
      whileHover={{ x: 5 }}
    >
      <div className="hidden md:block font-ui uppercase tracking-wider text-sm text-white/60">
        {away.name}
      </div>
      <div className="text-4xl font-display text-white">{away.code}</div>
    </motion.div>
  </div>
</motion.div>
```

---

### `HolographicField.tsx` - **Priority: HIGH** ⭐

**Current State:** Unique concept, needs polish
**Strengths:** Innovative tactical view
**Issues:**
- Scanning line animation is subtle
- Position nodes need better hover feedback
- Could use connection lines between filled positions
- Missing drag-and-drop capability

**Recommended Improvements:**

```tsx
export default function HolographicField({ roster, onPositionClick }: HolographicFieldProps) {
  return (
    <div className="relative w-full aspect-square max-w-2xl mx-auto perspective-1000">
      
      {/* Enhance the field container */}
      <motion.div 
        className="absolute inset-0 transform rotate-x-45 scale-90 bg-black/20 border border-white/10 rounded-full backdrop-blur-sm overflow-hidden"
        animate={{ 
          boxShadow: [
            "0 0 50px rgba(0,243,255,0.1)",
            "0 0 80px rgba(0,243,255,0.2)",
            "0 0 50px rgba(0,243,255,0.1)"
          ]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        
        {/* More visible grid */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{ 
            backgroundImage: 'linear-gradient(to right, #00F3FF 1px, transparent 1px), linear-gradient(to bottom, #00F3FF 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} 
        />
        
        {/* Enhanced diamond */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rotate-45 border-2 border-comets-cyan/30"
          animate={{ 
            boxShadow: [
              "0 0 20px rgba(0,243,255,0.2)",
              "0 0 40px rgba(0,243,255,0.4)",
              "0 0 20px rgba(0,243,255,0.2)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Make scanning line more dramatic */}
        <motion.div 
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-2 bg-comets-cyan/70 blur-sm"
          style={{ 
            boxShadow: "0 0 20px #00F3FF, 0 0 40px #00F3FF"
          }}
        />
      </motion.div>

      {/* Enhanced position nodes */}
      {Object.entries(POSITIONS).map(([pos, coords]) => {
        const player = roster[pos];
        return (
          <motion.button
            key={pos}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            whileHover={{ 
              scale: 1.3, 
              y: -8,
              boxShadow: player 
                ? "0 0 20px #F4D03F" 
                : "0 0 15px #00F3FF"
            }}
            whileTap={{ scale: 0.9 }}
            transition={{ 
              type: "spring", 
              stiffness: 400,
              damping: 15
            }}
            onClick={() => onPositionClick(pos)}
            className={cn(
              "absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300 focus-arcade cursor-pointer",
              player 
                ? "border-comets-yellow bg-black shadow-[0_0_15px_#F4D03F]" 
                : "border-white/20 bg-black/50 hover:border-comets-cyan hover:bg-comets-cyan/10"
            )}
            style={{ top: coords.top, left: coords.left }}
            tabIndex={0}
            aria-label={`${pos} position${player ? `: ${player.name}` : ' empty'}`}
          >
            {player ? (
              <motion.div 
                className="font-bold text-xs text-comets-yellow"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {player.name[0]}
              </motion.div>
            ) : (
              <div className="text-[10px] text-white/50 font-mono">{pos}</div>
            )}
            
            {/* Add pulse indicator for filled positions */}
            {player && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-comets-yellow"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
```

---

### `StatHighlight.tsx` - **Priority: MEDIUM**

**Current State:** Great showcase component
**Strengths:** Excellent layout, good animation
**Issues:**
- Stat bars could fill more dramatically
- Player avatar is static (could rotate/float)
- Background glow could pulse

**Recommended Enhancements:**

```tsx
// Enhance the player card container:
<motion.div
  initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
  whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
  whileHover={{ 
    rotateY: 5, 
    scale: 1.02,
    boxShadow: "0 0 60px rgba(0,243,255,0.3)"
  }}
  viewport={{ once: true }}
  transition={{ duration: 1, type: "spring" }}
  className="relative z-10 bg-surface-dark/90 border border-white/10 p-6 md:p-8 rounded-xl backdrop-blur-xl shadow-2xl"
>

// Make avatar float:
<motion.div 
  className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-display text-white shadow-lg"
  style={{ 
    background: "var(--neon-red)", 
    boxShadow: "0 0 20px rgba(255,77,77,0.5)" 
  }}
  animate={{ 
    y: [0, -5, 0],
    rotate: [0, 5, 0, -5, 0]
  }}
  transition={{ 
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut"
  }}
>
  M
</motion.div>

// Enhance stat bar fill:
<motion.div 
  initial={{ width: 0 }}
  whileInView={{ width: stat.width }}
  viewport={{ once: true }}
  transition={{ 
    delay: 0.5 + (i * 0.2), 
    duration: 1.5,
    ease: [0.34, 1.56, 0.64, 1] // Spring easing
  }}
  className={`h-full ${stat.color}`}
  style={{ 
    boxShadow: `0 0 15px currentColor`,
    filter: "brightness(1.2)"
  }}
/>

// Pulse the background glow:
<motion.div 
  className="absolute -inset-12 blur-3xl -z-10"
  style={{ 
    background: "linear-gradient(to top right, var(--neon-blue), var(--neon-purple))"
  }}
  animate={{ 
    opacity: [0.15, 0.25, 0.15],
    scale: [1, 1.1, 1]
  }}
  transition={{ 
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut"
  }}
/>
```

---

## 📐 LAYOUT COMPONENTS

### `Header.tsx` - **Priority: HIGH** ⭐

**Current State:** Functional but needs mobile work
**Strengths:** Good desktop nav with active states
**Issues:**
- **Missing mobile menu implementation** (critical)
- Search button doesn't do anything
- Nav pills could use more motion
- Logo could have power-up animation

**Recommended Improvements:**

```tsx
// Add mobile menu state and implementation:
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

// Replace search/menu section:
<div className="flex items-center gap-4">
  <button className="p-2 text-white/60 hover:text-comets-cyan hover:bg-white/10 rounded-full transition-colors arcade-press focus-arcade">
    <Search size={20} strokeWidth={1.5} />
  </button>
  
  {/* ADD MOBILE MENU BUTTON */}
  <button 
    className="md:hidden p-2 text-white hover:text-comets-yellow transition-colors arcade-press focus-arcade"
    onClick={() => setIsMobileMenuOpen(true)}
    aria-label="Open menu"
  >
    <Menu size={24} strokeWidth={1.5} />
  </button>
</div>

// ADD MOBILE MENU COMPONENT (after header):
<AnimatePresence>
  {isMobileMenuOpen && (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsMobileMenuOpen(false)}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-40 md:hidden"
      />
      
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 right-0 w-3/4 max-w-sm bg-surface-dark border-l border-white/10 z-50 md:hidden flex flex-col shadow-2xl"
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <div className="font-display text-xl text-white tracking-wider">
            SYSTEM <span className="text-comets-yellow">MENU</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-white/50 hover:text-white arcade-press"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="group flex items-center gap-4 p-4 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/5 transition-all arcade-press focus-arcade"
            >
              <div className="p-2 rounded bg-black/50 text-comets-cyan">
                <item.icon size={24} />
              </div>
              <span className="font-ui uppercase tracking-widest text-lg text-white/80 group-hover:text-white">
                {item.name}
              </span>
            </Link>
          ))}
        </div>

        <div className="p-6 border-t border-white/10 text-center">
          <div className="text-xs font-mono text-white/20 uppercase tracking-widest">
            Comets League System v2.0
          </div>
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>

// Enhance logo with power-up:
<div className="w-10 h-10 bg-comets-yellow rounded-sm flex items-center justify-center font-display text-black text-xl group-hover:scale-110 transition-transform duration-200 power-indicator">
  C
</div>
```

---

### `Sidebar.tsx` & `SidebarMobile.tsx` - **Priority: MEDIUM**

**Current State:** Well structured
**Strengths:** Good active state tracking, nice icons
**Issues:**
- Could use more hover feedback
- Menu items could have staggered entrance animation
- Missing tooltip for collapsed state (if you add that)

**Quick Win:**
Add staggered animation when component mounts:

```tsx
{menuItems.map((item, index) => {
  // ... existing code ...
  return (
    <motion.div
      key={item.name}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={item.href} className="relative block">
        {/* ... rest of link content ... */}
      </Link>
    </motion.div>
  );
})}
```

---

### `Footer.tsx` - **Priority: LOW**

**Current State:** Clean, functional
**Quick Wins:**
- Add underlines on hover (already noted in artifact)
- Make "PLAY BALL" text have slow scroll animation

```tsx
<motion.div 
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  className="font-display text-6xl md:text-[12vw] leading-[0.8] text-white/5 select-none pointer-events-none tracking-tighter"
  animate={{ 
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
  }}
  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
  style={{
    background: "linear-gradient(90deg, transparent 0%, rgba(0,243,255,0.1) 50%, transparent 100%)",
    backgroundSize: "200% 100%",
    backgroundClip: "text",
  }}
>
  PLAY BALL
</motion.div>
```

---

## 📊 PAGE COMPONENTS

### `StandingsTable` Implementation - **Priority: HIGH** ⭐

**Current State:** Excellent structure in `.txt` file
**Action Needed:** This is already well-designed! Just needs:

1. **Add loading skeleton** for when data is fetching
2. **Add sort functionality** to column headers
3. **Make rows clickable** to team detail pages

```tsx
// Add to top of component:
const [sortConfig, setSortConfig] = useState<{key: keyof TeamStanding, direction: 'asc' | 'desc'} | null>(null);

// Add sort handler:
const handleSort = (key: keyof TeamStanding) => {
  let direction: 'asc' | 'desc' = 'asc';
  if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
    direction = 'desc';
  }
  setSortConfig({ key, direction });
};

// Sort data before rendering:
const sortedData = React.useMemo(() => {
  let sortableData = [...MOCK_STANDINGS];
  if (sortConfig !== null) {
    sortableData.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
  return sortableData;
}, [sortConfig]);

// Add click handler to RetroTable:
onRowClick={(item) => router.push(`/teams/${item.id}`)}
```

---

## 🎯 PRIORITY SUMMARY

### Immediate (This Week):
1. ✅ **Header.tsx** - Add mobile menu
2. ✅ **RetroButton.tsx** - Add loading/disabled states
3. ✅ **TeamSelectCard.tsx** - Enhance hover animations
4. ✅ **VersusCard.tsx** - Add motion to scores
5. ✅ **Globals.css** - Add missing animation utilities

### Next Sprint:
6. **HolographicField.tsx** - Polish interactions
7. **RetroTable.tsx** - Add sorting
8. **StatHighlight.tsx** - Enhance animations
9. **StandingsTable** - Connect to routing

### Nice to Have:
10. RetroLoader - Add particles
11. Footer - Enhance text effects
12. Sidebar - Add staggered animations

---

## 🚀 QUICK WINS (Do These First)

These require minimal changes but maximum impact:

```css
/* Add to Globals.css - 5 minutes */
.arcade-press { /* Already covered above */ }
.focus-arcade { /* Already covered above */ }
.power-indicator { /* Already covered above */ }
```

```tsx
// Add to ALL interactive components - 2 minutes each
whileTap={{ scale: 0.98 }}
className="focus-arcade"
tabIndex={0}
```

```tsx
// Add to Header.tsx for logo - 1 minute
<div className="power-indicator">
  C
</div>
```

---

## 🔧 TOOLING RECOMMENDATIONS

**For Animation Consistency:**
Create a shared motion variants file:

```tsx
// lib/motion-variants.ts
export const buttonVariants = {
  hover: { scale: 1.05, y: -2 },
  tap: { scale: 0.98 },
};

export const cardVariants = {
  hover: { scale: 1.02, y: -4 },
  tap: { scale: 0.99 },
};

export const springTransition = {
  type: "spring",
  stiffness: 300,
  damping: 20,
};
```

**For Focus States:**
Create a shared focus style:

```tsx
// lib/focus-styles.ts
export const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-comets-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-black";
```

---

## 📝 TESTING CHECKLIST

After implementing improvements:

- [ ] Tab through entire page (keyboard navigation)
- [ ] Test on mobile viewport
- [ ] Verify all animations at 60fps
- [ ] Check color contrast ratios (WCAG AA)
- [ ] Test with screen reader
- [ ] Verify all hover states work
- [ ] Test all button pressed states
- [ ] Ensure no layout shift on load

---

**End of Review**

This should give you a clear roadmap! The components are well-architected - they just need that final arcade polish. Let me know which component you'd like to tackle first and I can provide the complete updated code.
