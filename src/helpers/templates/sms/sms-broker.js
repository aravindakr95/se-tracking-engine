function getRegistrationSMSTemplate(regDetails) {
    return `Account activation completed. You will be receiving monthly electricity statements now by electronically, through a brief statement to your ${regDetails.contactNumber} and descriptive statement to your ${regDetails.email}. Thank you for partnering with us`;
}

function getInvoiceSMSTemplate(invoice) {
    switch (invoice.tariff) {
    case 'Net Metering':
        return `Your electricity system ${invoice.accountNumber} produced ${invoice.totalProduction} units and consumed ${invoice.totalConsumption} units as of ${invoice.billingPeriod}. This month you have ${invoice.bfUnits} BF units as the excess units and total payable amount is ${invoice.netAmount} ${invoice.currency}`;

    case 'Net Accounting':
        return `Your electricity system ${invoice.accountNumber} produced ${invoice.totalProduction} units and consumed ${invoice.totalConsumption} units as of ${invoice.billingPeriod}. This month you have ${invoice.yield} income and total payable amount is ${invoice.netAmount} ${invoice.currency}`;

    default:
        return '';
    }
}

module.exports = { getRegistrationSMSTemplate, getInvoiceSMSTemplate };
