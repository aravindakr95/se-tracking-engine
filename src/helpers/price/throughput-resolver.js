import SchemaType from '../../enums/account/schema-type';
import HouseholdFloor from '../../enums/device/household-floor';

import { calculateIncome, calculateExpense } from './price-resolver';
import makeTwoDecimalNumber from '../utilities/number-resolver';
import customException from '../utilities/custom-exception';

function calculateDailyProduction(pvStats) {
  if (!pvStats || (!pvStats.latest || !pvStats.oldest)) {
    throw customException('PV stats, PV stats latest or old fields are empty');
  }

  const result = pvStats.latest.totalEnergy - pvStats.oldest.totalEnergy;

  return makeTwoDecimalNumber(result);
}

function calculateDailyConsumption(pgStats) {
  if (!pgStats || (!pgStats[0].latest.length || !pgStats[0].oldest.length)) {
    throw customException('PG stats, PG stats latest or old fields are empty');
  }

  const groundFloorLatest = pgStats[0].latest
    .find((stat) => stat.id === HouseholdFloor.FIRST);

  const firstFloorLatest = pgStats[0].latest
    .find((stat) => stat.id === HouseholdFloor.SECOND);

  const groundFloorOldest = pgStats[0].oldest
    .find((stat) => stat.id === HouseholdFloor.FIRST);

  const firstFloorOldest = pgStats[0].oldest
    .find((stat) => stat.id === HouseholdFloor.SECOND);

  if (!groundFloorLatest || (!groundFloorLatest.result || !firstFloorLatest.result)
        || (!groundFloorOldest.result || !firstFloorOldest.result)) {
    throw customException('One or more data fields are empty');
  }

  const result = (groundFloorLatest.result.totalPower - groundFloorOldest.result.totalPower)
        + (firstFloorLatest.result.totalPower - firstFloorOldest.result.totalPower);

  return makeTwoDecimalNumber(result);
}

function calculateMonthlyProduction(pvStats, duration) {
  if (!pvStats || !pvStats.length) {
    throw customException('PV stats summary records are empty');
  }

  const totalProduction = pvStats.reduce((acc, current) => acc + current.productionToday, 0);

  const avgDailyProduction = totalProduction / duration;

  return {
    totalProduction: makeTwoDecimalNumber(totalProduction),
    avgDailyProduction: makeTwoDecimalNumber(avgDailyProduction),
  };
}

function calculateMonthlyConsumption(dateTime, consumer, pgStats, production, duration) {
  let bfUnits = 0;
  let income = 0;

  let totalGridImported = 0;
  let grossAmount = 0;
  let fixedCharge = 0;
  let netAmount = 0;

  let expense = null;

  if (!pgStats || !pgStats.length) {
    throw customException('PG stats summary records are empty');
  }

  const totalConsumption = pgStats.reduce((acc, current) => acc + current.consumptionToday, 0);

  const excessEnergy = production.totalProduction - totalConsumption;

  const avgDailyConsumption = totalConsumption / duration;

  if (excessEnergy > 0) {
    bfUnits = consumer.tariff === SchemaType.NET_METERING
      ? excessEnergy : -1;
    income = consumer.tariff === SchemaType.NET_ACCOUNTING
      ? calculateIncome(dateTime, consumer, excessEnergy) : -1;
  } else {
    totalGridImported = Math.abs(excessEnergy);
  }

  bfUnits = consumer.tariff === SchemaType.NET_METERING ? bfUnits : -1;
  income = consumer.tariff === SchemaType.NET_ACCOUNTING ? makeTwoDecimalNumber(income) : -1;

  if (totalGridImported) {
    expense = calculateExpense(consumer.billingCategory, duration, totalGridImported);

    grossAmount = expense.grossAmount;
    fixedCharge = expense.fixedCharge;
    netAmount = expense.netAmount;
  }

  return {
    previousDue: 0, // todo: payment API integration required (mock for the moment)
    yield: income,
    grossAmount,
    fixedCharge,
    netAmount,
    bfUnits: makeTwoDecimalNumber(bfUnits),
    totalGridImported: makeTwoDecimalNumber(totalGridImported),
    totalConsumption: makeTwoDecimalNumber(totalConsumption),
    avgDailyConsumption: makeTwoDecimalNumber(avgDailyConsumption),
  };
}

export {
  calculateDailyProduction,
  calculateDailyConsumption,
  calculateMonthlyProduction,
  calculateMonthlyConsumption,
};
