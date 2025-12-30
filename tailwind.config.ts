// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Custom Colors
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },

      // Custom Animations
      animation: {
        // Fade animations
        'fade-in': 'fadeIn 0.5s ease-in',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        
        // Slide animations
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'slide-in-left': 'slideInLeft 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        
        // Scale animations
        'scale-in': 'scaleIn 0.3s ease-out',
        'scale-out': 'scaleOut 0.3s ease-in',
        'scale-pulse': 'scalePulse 2s ease-in-out infinite',
        
        // Blob animation
        'blob': 'blob 7s infinite',
        
        // Float animation
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        
        // Shimmer effect
        'shimmer': 'shimmer 2s infinite',
        
        // Pulse variations
        'pulse-slow': 'pulseSlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulseFast 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        
        // Bounce variations
        'bounce-slow': 'bounceSlow 2s infinite',
        'bounce-subtle': 'bounceSubtle 3s infinite',
        
        // Spin variations
        'spin-slow': 'spinSlow 3s linear infinite',
        'spin-reverse': 'spinReverse 1s linear infinite',
        
        // Wiggle
        'wiggle': 'wiggle 1s ease-in-out infinite',
        
        // Shake
        'shake': 'shake 0.5s ease-in-out',
        
        // Glow
        'glow': 'glow 2s ease-in-out infinite',
        
        // Typing effect
        'typing': 'typing 3.5s steps(40, end), blink 0.75s step-end infinite',
      },

      // Custom Keyframes
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.8)' },
        },
        scalePulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        pulseFast: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        bounceSlow: {
          '0%, 100%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(-10%)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        spinSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        spinReverse: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(10px)' },
        },
        glow: {
          '0%, 100%': { 
            boxShadow: '0 0 5px rgba(59, 130, 246, 0.5), 0 0 10px rgba(59, 130, 246, 0.3)' 
          },
          '50%': { 
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.5)' 
          },
        },
        typing: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        blink: {
          '50%': { borderColor: 'transparent' },
        },
      },

      // Custom Box Shadows
      boxShadow: {
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.5)',
        'glow-pink': '0 0 20px rgba(236, 72, 153, 0.5)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.5)',
        'inner-glow': 'inset 0 0 20px rgba(59, 130, 246, 0.3)',
      },

      // Custom Backdrop Blur
      backdropBlur: {
        xs: '2px',
      },

      // Custom Border Radius
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // Custom Spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      // Custom Z-Index
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },

      // Custom Transitions
      transitionDuration: {
        '2000': '2000ms',
        '3000': '3000ms',
      },

      // Custom Gradients
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
      },
    },
  },
  plugins: [],
};

export default config;