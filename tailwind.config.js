/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 腾讯云品牌色
        brand: {
          DEFAULT: '#0052D9',
          hover: '#0034B5',
          light: '#366EF4',
          bg: '#BDD2FF',
          'bg-light': '#F2F3FF',
        },
        // 功能色
        tc: {
          success: '#2BA471',
          error: '#D54941',
          warning: '#E37318',
          info: '#0052D9',
        },
        // 文本色
        'tc-text': {
          primary: '#181818',
          secondary: '#4B4B4B',
          placeholder: '#8C8C8C',
          disabled: '#C0C0C0',
        },
        // 背景色
        'tc-bg': {
          page: '#F7F8FA',
          container: '#FFFFFF',
          secondary: '#F3F3F3',
        },
        // 边框色
        'tc-border': {
          DEFAULT: '#DCDCDC',
          light: '#E7E7E7',
        },
        // shadcn 兼容
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
      },
      fontFamily: {
        sans: ['PingFang SC', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Microsoft YaHei', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'tc-1': '0 1px 4px rgba(0, 0, 0, 0.05)',
        'tc-2': '0 3px 14px rgba(0, 0, 0, 0.08)',
        'tc-3': '0 6px 30px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'slide-in-top': 'slideInFromTop 0.4s ease-out',
        'slide-in-bottom': 'slideInFromBottom 0.4s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        slideInFromTop: {
          from: { transform: 'translateY(-20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideInFromBottom: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
