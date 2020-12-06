import { Options, Aws } from 'aws-cli-js';

import config from '../../config/config';

import { makeTwoDecimalNumber } from '../utilities/number-resolver';

async function getAWSConfig() {
    const options = new Options(
        config.sdk.accessKey,
        config.sdk.secretKey,
        config.sdk.sessionToken
    );

    return new Aws(options);
}

async function generateForecastValues(dateRange, accNumber) {
    const AWS = getAWSConfig();
    const { startDate, endDate } = dateRange;

    let cmd = `forecastquery query-forecast --forecast-arn ${config.sdk.forecastArn}`;

    if (startDate > endDate || endDate < startDate) {
        return 0;
    }

    cmd = cmd + `--start-date ${startDate}`;
    cmd = cmd + `--end-date ${endDate}`;
    cmd = cmd + `--filter ${accNumber}`;

    return await AWS.command(cmd).catch(error => error);
}

function getAvgValues(reports, endDate) {
    let totalValues = 0;

    reports.map((report) => {
        totalValues = totalValues + report.netAmount;
    });

    return {
        Forecast: {
            Predictions: {
                mean: [
                    {
                        Timestamp: endDate.toISOString(),
                        Value: makeTwoDecimalNumber(totalValues / reports.length)
                    }
                ]
            }
        }
    };
}

module.exports = { generateForecastValues, getAvgValues };
