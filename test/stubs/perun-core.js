// `axios` throws unless a test replaces it, so a test that reaches the network fails instead of hanging.
export const axios = () => {
  throw new Error('perun-core stub: a test called axios without replacing it');
};

axios.get = axios;
axios.post = axios;

export const utils = {};
export const elements = {};
