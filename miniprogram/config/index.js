const ENV = 'prod';

const CONFIG = {
  dev: {
    API_BASE_URL: 'http://localhost:3000',
  },
  staging: {
    API_BASE_URL: 'https://api.gjxpress.net',
  },
  prod: {
    API_BASE_URL: 'https://api.gjxpress.net',
  },
};

module.exports = {
  ENV,
  ...CONFIG[ENV],
};
