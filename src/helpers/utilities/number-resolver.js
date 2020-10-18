function makeTwoDecimalFixed(value) {
    const formatted = Number.parseFloat(value).toFixed(2);
    return Number(formatted);
}

module.exports = { makeTwoDecimalFixed };
