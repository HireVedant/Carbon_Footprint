/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── Primary Brand: Forest (§9 DESIGN.md) ──────────────────────
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#166534',
          800: '#14532d',
          900: '#052e16',
          950: '#022c17',
        },
        accent: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        eco: {
          leaf: '#10b981',
          mint: '#34d399',
          neon: '#6ee7b7',
          forest: '#042e20',
          deep: '#021810',
          sun: '#f59e0b',
          bio: '#14b8a6',
        },

        // ─── Water Palette (§9 DESIGN.md) ──────────────────────────────
        water: {
          river: '#0EA5E9',
          lake: '#38BDF8',
          sky: '#7DD3FC',
          mist: '#E0F2FE',
        },

        // ─── Earth Palette (§9 DESIGN.md) ──────────────────────────────
        earth: {
          soil: '#78350F',
          clay: '#92400E',
          sand: '#D6B370',
          stone: '#57534E',
        },

        // ─── Solar Palette (§9 DESIGN.md) ──────────────────────────────
        solar: {
          yellow: '#FACC15',
          sunlight: '#FDE047',
          amber: '#F59E0B',
          orange: '#FB923C',
        },

        // ─── Carbon Palette (§9 DESIGN.md) ─────────────────────────────
        carbon: {
          smoke: '#64748B',
          ash: '#475569',
          dark: '#334155',
          danger: '#DC2626',
          critical: '#991B1B',
        },

        // ─── Neutral / Dark Surface (§9 DESIGN.md) ─────────────────────
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },

        // ─── Semantic aliases ───────────────────────────────────────────
        surface: '#0F172A',
        panel: '#1E293B',
        border: '#334155',
        'text-primary': '#F8FAFC',
        'text-secondary': '#94A3B8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'eco-glow': '0 0 25px -5px rgba(16, 185, 129, 0.4)',
        'eco-glow-lg': '0 0 45px -5px rgba(16, 185, 129, 0.5)',
        'mint-glow': '0 0 30px -5px rgba(52, 211, 153, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'elevation-1': '0 4px 16px rgba(0, 0, 0, 0.2)',
        'elevation-2': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'elevation-3': '0 16px 48px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'leaf-sway': 'leafSway 4s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(16, 185, 129, 0.7)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        leafSway: {
          '0%, 100%': { transform: 'rotate(-4deg) translateY(0)' },
          '50%': { transform: 'rotate(4deg) translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-gradient': 'linear-gradient(135deg, #021710 0%, #064e3b 45%, #0f172a 100%)',
        'eco-mesh': 'radial-gradient(circle at 50% 0%, rgba(16,185,129,0.15) 0%, rgba(2,23,16,0.95) 75%)',
        'shimmer-gradient': 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0) 100%)',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
      },
      backdropBlur: {
        'glass': '18px',
        'glass-strong': '24px',
      },
    },
  },
  plugins: [],
};