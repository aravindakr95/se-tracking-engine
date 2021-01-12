import config from '../config/config';

export default function makeMetaList() {
    return Object.freeze({
        getServerVersion
    });

    function getServerVersion() {
        return config.version;
    }
}
