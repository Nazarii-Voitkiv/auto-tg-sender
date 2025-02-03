declare global {
  interface Window {
    env: {
      API_URL?: string;
    };
  }
}

export const environment = {
  production: false,
  apiUrl: window.env?.API_URL || 'http://localhost:3000/api'
};
