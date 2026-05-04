const ENV = 'dev';

const CONFIG = {
  dev: {
    API_BASE_URL: 'http://localhost:3000/api',
  },
  staging: {
    API_BASE_URL: 'https://api.gjxpress.net/api',
  },
  prod: {
    API_BASE_URL: 'https://api.gjxpress.net/api',
  },
};

module.exports = {
  ENV,
  ...CONFIG[ENV],
};
