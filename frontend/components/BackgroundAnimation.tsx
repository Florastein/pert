import React, { useMemo } from 'react';

const SHAPE_COUNT = 12;
const MAX_SIZE = 120;
const MIN_SIZE = 40;

interface FloatingShape {
  id: string;
  size: number;
  duration: number;
  delay: number;
  left: number;
  top: number;
  opacity: number;
  blur: number;
  colorClass: string;
  shapeType: 'circle' | 'blob' | 'organic';
}

const generateShapes = (): FloatingShape[] => {
  return Array.from({ length: SHAPE_COUNT }).map((_, i) => {
    const size = Math.floor(Math.random() * (MAX_SIZE - MIN_SIZE)) + MIN_SIZE;
    const duration = Math.floor(Math.random() * 25) + 20; // 20s to 45s
    const delay = Math.floor(Math.random() * 15); // 0s to 15s delay
    const left = Math.floor(Math.random() * 100); // 0% to 100%
    const top = Math.floor(Math.random() * 100); // 0% to 100%
    const opacity = Math.random() * 0.15 + 0.05; // 5% to 20% opacity
    const blur = Math.floor(Math.random() * 40) + 20; // 20px to 60px blur
    
    // Orange theme color variations
    const colorVariations = [
      'bg-amber-200/40',      // Light amber
      'bg-orange-300/30',     // Medium orange
      'bg-amber-300/25',      // Warm amber
      'bg-orange-200/35',     // Soft orange
      'bg-amber-400/20',      // Deep amber
    ];
    
    const shapeTypes: Array<'circle' | 'blob' | 'organic'> = ['circle', 'blob', 'organic'];
    const shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    
    const colorClass = colorVariations[Math.floor(Math.random() * colorVariations.length)];

    return {
      id: `shape-${i}`,
      size,
      duration,
      delay,
      left,
      top,
      opacity,
      blur,
      colorClass,
      shapeType
    };
  });
};

const getShapeClass = (shapeType: 'circle' | 'blob' | 'organic'): string => {
  switch (shapeType) {
    case 'circle':
      return 'rounded-full';
    case 'blob':
      return 'rounded-[40%]';
    case 'organic':
      return 'rounded-[50%_30%_60%_40%]';
    default:
      return 'rounded-full';
  }
};

const FloatingShape: React.FC<{ shape: FloatingShape }> = ({ shape }) => {
  const style: React.CSSProperties = {
    width: `${shape.size}px`,
    height: `${shape.size}px`,
    left: `${shape.left}%`,
    top: `${shape.top}%`,
    opacity: shape.opacity,
    filter: `blur(${shape.blur}px)`,
    animation: `float ${shape.duration}s ease-in-out ${shape.delay}s infinite`,
    transform: 'translateZ(0)', // Hardware acceleration
  };

  const shapeClass = getShapeClass(shape.shapeType);

  return (
    <div
      key={shape.id}
      className={`absolute ${shapeClass} ${shape.colorClass} will-change-transform`}
      style={style}
    />
  );
};

export const BackgroundAnimation: React.FC = () => {
  const shapes = useMemo(() => generateShapes(), []);

  return (
    <>
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg) scale(1);
            animation-timing-function: ease-in-out;
          }
          25% {
            transform: translateY(-20px) rotate(90deg) scale(1.05);
            animation-timing-function: ease-out;
          }
          50% {
            transform: translateY(-40px) rotate(180deg) scale(1.1);
            animation-timing-function: ease-in-out;
          }
          75% {
            transform: translateY(-20px) rotate(270deg) scale(1.05);
            animation-timing-function: ease-in;
          }
        }
        
        @keyframes gentle-pulse {
          0%, 100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.2;
          }
        }
        
        .background-container {
          animation: gentle-pulse 20s ease-in-out infinite;
        }
      `}</style>
      
      <div 
        className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 background-container"
        aria-hidden="true"
      >
        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-amber-50/30" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-orange-100/10 to-transparent" />
        
        {/* Main floating shapes */}
        {shapes.map(shape => (
          <FloatingShape key={shape.id} shape={shape} />
        ))}
        
        {/* Subtle particle effects */}
        <div className="absolute inset-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute w-2 h-2 bg-orange-300/20 rounded-full blur-sm"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 15 + 10}s ease-in-out ${Math.random() * 10}s infinite`,
                opacity: Math.random() * 0.3 + 0.1,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
};

// Alternative minimal version for performance-critical scenarios
export const MinimalBackgroundAnimation: React.FC = () => {
  const shapes = useMemo(() => generateShapes().slice(0, 6), []);

  return (
    <div 
      className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/60 to-amber-50/40" />
      {shapes.map(shape => (
        <FloatingShape key={shape.id} shape={shape} />
      ))}
    </div>
  );
};