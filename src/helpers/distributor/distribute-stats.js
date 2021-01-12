import axios from 'axios';

import config from '../../config/config';

import OperationStatus from '../../models/common/operation-status';

async function distributeStats(stats, type) {
    let options = null;

    switch (type) {
    case OperationStatus.GridSuccess:
        options = {
            url: config.distributor.gridSuccessUrl,
            method: 'get',
            headers: {
                'Content-Type': 'application/json'
            },
            params: {
                deviceId: stats.deviceId,
                slave: stats.slaveId,
                v: stats.voltage,
                a: stats.current,
                w: stats.power,
                hz: stats.frequency,
                kwh: stats.totalPower,
                im_kwh: stats.importPower,
                pf: stats.powerFactor,
                ex_kwh: stats.exportPower,
                rssi: stats.rssi,
                c: stats.currentRound
            }
        };

        return await axios.get(options.url, options);
    case OperationStatus.GridError:
        options = {
            url: config.distributor.gridErrorUrl,
            method: 'get',
            headers: {
                'Content-Type': 'application/json'
            },
            params: {
                deviceId: stats.deviceId,
                error: stats.error,
                rssi: stats.rssi,
                wifiFailed: stats.wifiFailCount,
                httpFailed: stats.httpFailCount
            }
        };

        return await axios.get(options.url, options);
    case OperationStatus.PVSuccess:
        options = {
            url: config.distributor.pvSuccessUrl,
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        return await axios.post(options.url, stats, options);
    }

}

module.exports = { distributeStats };
