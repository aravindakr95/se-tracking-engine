import axios from 'axios';

import config from '../../config/config';

async function fetchInverter() {
  const opt = {
    url: config.inverter.url,
    method: 'post',
  };

  const body = {
    SN: config.inverter.serialNumber,
    email: config.inverter.email,
  };

  const options = {
    url: opt.url,
    method: opt.method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  return await axios.post(opt.url, body, options);
}

export default fetchInverter;
