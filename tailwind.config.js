/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Biblical-themed color palette
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Biblical tier colors
        biblical: {
          // K1NGxDAV1D - Royal Purple
          king: {
            50: '#f8f7ff',
            100: '#f0edff',
            200: '#e4dcff',
            300: '#d1bfff',
            400: '#b898ff',
            500: '#9d6aff',
            600: '#8b4aff',
            700: '#7c37f5',
            800: '#6528d9',
            900: '#5423b8',
          },
          // M3LCH1Z3D3K - Wisdom Gold
          wisdom: {
            50: '#fffef7',
            100: '#fffbeb',
            200: '#fef3c7',
            300: '#fde68a',
            400: '#fcd34d',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
          },
          // 3L1J4H - Security Silver
          security: {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827',
          },
          // M0S3S - Infrastructure Blue
          infrastructure: {
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
          // IESOUS - Divine Light
          divine: {
            50: '#fefce8',
            100: '#fef9c3',
            200: '#fef08a',
            300: '#fde047',
            400: '#facc15',
            500: '#eab308',
            600: '#ca8a04',
            700: '#a16207',
            800: '#854d0e',
            900: '#713f12',
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "biblical-glow": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(157, 106, 255, 0.5)"
          },
          "50%": {
            boxShadow: "0 0 40px rgba(157, 106, 255, 0.8)"
          },
        },
        "wisdom-pulse": {
          "0%, 100%": {
            opacity: 1,
            transform: "scale(1)"
          },
          "50%": {
            opacity: 0.8,
            transform: "scale(1.05)"
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "biblical-glow": "biblical-glow 3s ease-in-out infinite",
        "wisdom-pulse": "wisdom-pulse 2s ease-in-out infinite",
      },
      fontFamily: {
        'biblical': ['Cinzel', 'serif'],
        'modern': ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'biblical-gradient': 'linear-gradient(135deg, #7c37f5 0%, #9d6aff 50%, #b898ff 100%)',
        'wisdom-gradient': 'linear-gradient(135deg, #f59e0b 0%, #fcd34d 50%, #fef3c7 100%)',
        'divine-gradient': 'linear-gradient(135deg, #eab308 0%, #facc15 50%, #fef08a 100%)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}