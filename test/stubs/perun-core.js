/**
 * The shell, as the modules under test see it.
 *
 * Only what they import. `axios` is here to be replaced with a spy by the tests
 * that post something, and to throw in the ones that do not -- a unit test that
 * reaches the network has stopped being one, and this makes that a failure
 * rather than a hang.
 */
export const axios = () => {
  throw new Error('perun-core stub: a test called axios without replacing it');
};

axios.get = axios;
axios.post = axios;

export const utils = {};
export const elements = {};
