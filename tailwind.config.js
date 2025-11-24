/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',

        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },

        /* === Primary mapped to auto-derived shades === */
        primary: {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
          DEFAULT: 'var(--primary-500)',
          foreground: 'var(--primary-foreground)',
        },
        dashboard: {
          blue: {
            50: 'var(--dashboard-blue-50)',
            100: 'var(--dashboard-blue-100)',
            200: 'var(--dashboard-blue-200)',
            300: 'var(--dashboard-blue-300)',
            400: 'var(--dashboard-blue-400)',
            500: 'var(--dashboard-blue-500)',
            600: 'var(--dashboard-blue-600)',
            700: 'var(--dashboard-blue-700)',
            800: 'var(--dashboard-blue-800)',
            900: 'var(--dashboard-blue-900)',
            DEFAULT: 'var(--dashboard-blue-500)',
            foreground: 'var(--dashboard-blue-foreground)',
          },
          ocean: {
            50: 'var(--dashboard-ocean-50)',
            100: 'var(--dashboard-ocean-100)',
            200: 'var(--dashboard-ocean-200)',
            300: 'var(--dashboard-ocean-300)',
            400: 'var(--dashboard-ocean-400)',
            500: 'var(--dashboard-ocean-500)',
            600: 'var(--dashboard-ocean-600)',
            700: 'var(--dashboard-ocean-700)',
            800: 'var(--dashboard-ocean-800)',
            900: 'var(--dashboard-ocean-900)',
            DEFAULT: 'var(--dashboard-ocean-500)',
            foreground: 'var(--dashboard-ocean-foreground)',
          },
          green: {
            50: 'var(--dashboard-green-50)',
            100: 'var(--dashboard-green-100)',
            200: 'var(--dashboard-green-200)',
            300: 'var(--dashboard-green-300)',
            400: 'var(--dashboard-green-400)',
            500: 'var(--dashboard-green-500)',
            600: 'var(--dashboard-green-600)',
            700: 'var(--dashboard-green-700)',
            800: 'var(--dashboard-green-800)',
            900: 'var(--dashboard-green-900)',
            DEFAULT: 'var(--dashboard-green-500)',
            foreground: 'var(--dashboard-green-foreground)',
          },
          yellow: {
            50: 'var(--dashboard-yellow-50)',
            100: 'var(--dashboard-yellow-100)',
            200: 'var(--dashboard-yellow-200)',
            300: 'var(--dashboard-yellow-300)',
            400: 'var(--dashboard-yellow-400)',
            500: 'var(--dashboard-yellow-500)',
            600: 'var(--dashboard-yellow-600)',
            700: 'var(--dashboard-yellow-700)',
            800: 'var(--dashboard-yellow-800)',
            900: 'var(--dashboard-yellow-900)',
            DEFAULT: 'var(--dashboard-yellow-500)',
            foreground: 'var(--dashboard-yellow-foreground)',
          },
          purble: {
            50: 'var(--dashboard-purble-50)',
            100: 'var(--dashboard-purble-100)',
            200: 'var(--dashboard-purble-200)',
            300: 'var(--dashboard-purble-300)',
            400: 'var(--dashboard-purble-400)',
            500: 'var(--dashboard-purble-500)',
            600: 'var(--dashboard-purble-600)',
            700: 'var(--dashboard-purble-700)',
            800: 'var(--dashboard-purble-800)',
            900: 'var(--dashboard-purble-900)',
            DEFAULT: 'var(--dashboard-purble-500)',
            foreground: 'var(--dashboard-purble-foreground)',
          },
        },

        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },

        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',

        chart: {
          1: 'var(--chart-1)',
          2: 'var(--chart-2)',
          3: 'var(--chart-3)',
          4: 'var(--chart-4)',
          5: 'var(--chart-5)',
        },

        sidebar: {
          DEFAULT: 'var(--sidebar-background)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)',
        },

        /* (optional) futuristic + orb + dashboard colors remain as your project defines */
        'channel-header': {
          DEFAULT: 'var(--channel-header)',
          foreground: 'var(--channel-header-foreground)',
        },
        'performance-bg': {
          1: 'var(--performance-bg-1)',
          2: 'var(--performance-bg-2)',
          3: 'var(--performance-bg-3)',
          4: 'var(--performance-bg-4)',
          5: 'var(--performance-bg-5)',
          6: 'var(--performance-bg-6)',
          7: 'var(--performance-bg-7)',
          8: 'var(--performance-bg-8)',
        },

        'dsqr-warning': 'var(--dsqr-warning)',
        'dsqr-warning-foreground': 'var(--dsqr-warning-foreground)',
      },

      boxShadow: {
        realistic: 'var(--shadow-realistic)',
        'realistic-lg': 'var(--shadow-realistic-lg)',
        'realistic-xl': 'var(--shadow-realistic-xl)',
      },

      backgroundImage: {
        'futuristic-gradient': 'var(--gradient-primary)',
        'futuristic-hover': 'var(--gradient-hover)',
        'futuristic-text': 'var(--gradient-text)',
      },

      backdropBlur: {
        glass: '12px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
