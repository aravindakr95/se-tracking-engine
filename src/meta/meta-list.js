import config from '../config/config';

export default function makeMetaList() {
  function getServerVersion() {
    return config.version;
  }

  return Object.freeze({
    getServerVersion,
  });
}
