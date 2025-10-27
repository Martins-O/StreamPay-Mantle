import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-40">
      <svg
        className="absolute w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(165, 80%, 45%)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="hsl(175, 70%, 35%)" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="gradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(175, 70%, 35%)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="hsl(165, 80%, 45%)" stopOpacity="0.05" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Animated Wave 1 */}
        <motion.path
          d="M0,400 Q480,300 960,400 T1920,400 L1920,1080 L0,1080 Z"
          fill="url(#gradient1)"
          initial={{ d: "M0,400 Q480,300 960,400 T1920,400 L1920,1080 L0,1080 Z" }}
          animate={{
            d: [
              "M0,400 Q480,300 960,400 T1920,400 L1920,1080 L0,1080 Z",
              "M0,450 Q480,350 960,450 T1920,450 L1920,1080 L0,1080 Z",
              "M0,400 Q480,300 960,400 T1920,400 L1920,1080 L0,1080 Z",
            ],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Animated Wave 2 */}
        <motion.path
          d="M0,500 Q480,450 960,500 T1920,500 L1920,1080 L0,1080 Z"
          fill="url(#gradient2)"
          initial={{ d: "M0,500 Q480,450 960,500 T1920,500 L1920,1080 L0,1080 Z" }}
          animate={{
            d: [
              "M0,500 Q480,450 960,500 T1920,500 L1920,1080 L0,1080 Z",
              "M0,550 Q480,500 960,550 T1920,550 L1920,1080 L0,1080 Z",
              "M0,500 Q480,450 960,500 T1920,500 L1920,1080 L0,1080 Z",
            ],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        {/* Animated Circles/Particles */}
        {[...Array(15)].map((_, i) => (
          <motion.circle
            key={i}
            cx={Math.random() * 1920}
            cy={Math.random() * 1080}
            r={Math.random() * 3 + 1}
            fill="hsl(165, 80%, 45%)"
            opacity="0.3"
            filter="url(#glow)"
            initial={{
              cx: Math.random() * 1920,
              cy: Math.random() * 1080,
            }}
            animate={{
              cx: [
                Math.random() * 1920,
                Math.random() * 1920,
                Math.random() * 1920,
              ],
              cy: [
                Math.random() * 1080,
                Math.random() * 1080,
                Math.random() * 1080,
              ],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
          />
        ))}

        {/* Floating Lines */}
        {[...Array(8)].map((_, i) => {
          const startX = Math.random() * 1920;
          const startY = Math.random() * 1080;
          const endX = startX + Math.random() * 400 - 200;
          const endY = startY + Math.random() * 400 - 200;
          
          return (
            <motion.line
              key={`line-${i}`}
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke="hsl(165, 80%, 45%)"
              strokeWidth="1"
              opacity="0.15"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 1, 0],
                opacity: [0, 0.15, 0],
              }}
              transition={{
                duration: Math.random() * 8 + 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 3,
              }}
            />
          );
        })}

        {/* Grid Pattern */}
        <pattern
          id="grid"
          width="50"
          height="50"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 50 0 L 0 0 0 50"
            fill="none"
            stroke="hsl(165, 80%, 45%)"
            strokeWidth="0.5"
            opacity="0.05"
          />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Radial Gradient Overlay */}
        <defs>
          <radialGradient id="radial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="100%" stopColor="hsl(170, 50%, 8%)" stopOpacity="0.3" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#radial)" />
      </svg>
    </div>
  );
};

export default AnimatedBackground;
