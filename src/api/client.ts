export const baseUrl = 'http://localhost:1337';

export const apiUrl = baseUrl + '/api';

const client = async (endpoint: string, options = {}) => {
  const url = apiUrl + endpoint;
  console.log('fetching: ', url);
  try {
    const res = await fetch(url, options);
    if (res.json && res.body) return await res.json();
    if (res.body) return res.body;
    return res;
  } catch (e) {
    console.error(e);
    throw new Error('client error on ' + apiUrl);
  }
};

export default client;
