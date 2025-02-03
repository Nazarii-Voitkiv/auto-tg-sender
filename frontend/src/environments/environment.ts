declare global {
  interface Window {
    env: {
      API_URL?: string;
    };
  }
}

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
