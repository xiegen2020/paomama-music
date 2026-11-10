import { defineConfig, presetUno } from 'unocss';

export default defineConfig({
  presets: [
    presetUno(),
  ],
  theme: {
    colors: {
      runner: {
        primary: '#E53935',
        'primary-light': '#FF5252',
        'primary-dark': '#C62828',
        accent: '#FF6D00',
        'accent-light': '#FF9100',
        success: '#00C853',
        bg: '#FAFAFA',
        'bg-subtle': '#F5F5F5',
        surface: '#FFFFFF',
        text: '#1A1A1A',
        'text-secondary': '#4A4A4A',
        'text-muted': '#8A8A8A',
        border: '#E8E8E8',
      },
    },
    fontSize: {
      'runner-xs': '12px',
      'runner-sm': '14px',
      'runner-base': '16px',
      'runner-lg': '20px',
      'runner-xl': '28px',
      'runner-2xl': '36px',
      'runner-3xl': '48px',
    },
    borderRadius: {
      runner: '12px',
      'runner-lg': '16px',
      'runner-xl': '20px',
    },
  },
  shortcuts: {
    'runner-btn': 'inline-flex items-center justify-center px-5 py-2.5 rounded-runner text-runner-base font-semibold transition-all duration-200 cursor-pointer select-none active:scale-95',
    'runner-btn-primary': 'runner-btn bg-runner-primary text-white hover:bg-runner-primary-light shadow-sm hover:shadow-md',
    'runner-btn-outline': 'runner-btn border-2 border-runner-primary text-runner-primary hover:bg-runner-primary hover:text-white',
    'runner-btn-ghost': 'runner-btn text-runner-text-secondary hover:bg-runner-bg-subtle',
    'runner-card': 'bg-runner-surface rounded-runner-lg p-5 border border-runner-border shadow-sm hover:shadow-md transition-shadow duration-200',
    'runner-input': 'w-full px-4 py-3 rounded-runner bg-runner-surface border border-runner-border text-runner-text text-runner-base outline-none focus:border-runner-primary focus:ring-2 focus:ring-runner-primary/20 transition-all duration-200',
    'runner-badge': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-runner-xs font-medium',
    'runner-badge-primary': 'runner-badge bg-runner-primary/10 text-runner-primary',
    'runner-section': 'py-6 px-4',
  },
});
