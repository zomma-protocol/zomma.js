import BigNumber from "bignumber.js";
import { BlackScholesSimple } from "./black-scholes-simple.js";
const UNIT = new BigNumber('1000000000000000000'); // 1e18
const MAX_PRICE_ADJUSTMENT = new BigNumber('2');
const MIN_PRICE_ADJUSTMENT = new BigNumber('0.5');
export const INT256_MAX = new BigNumber('57896044618658097711785492504343953926634992332820282019728792003956564819967');
export class OptionPricer {
  constructor() {
    this.blackScholesSimple = new BlackScholesSimple();
  }
  getPremium(params) {
    if (params.iv.lte(0)) {
      throw new Error("iv is 0");
    }
    const isBuy = params.size.gt(0);

    // calculate volatility and rate
    const volatility = params.iv.div(1e18).toNumber();
    const rate = params.riskFreeRate.div(1e18).toNumber();
    const timeToExpirySeconds = params.expiry - params.now;

    // convert input price (from wei to ETH)
    const spotPrice = Number(params.spot);
    const strikePrice = Number(params.strike);

    // calculate Black-Scholes price
    const rawPrice = this.blackScholesSimple.getPrice(params.isCall, params.expiry, timeToExpirySeconds, volatility, spotPrice, strikePrice, rate);

    // convert price to wei
    let price = new BigNumber(rawPrice);
    price = this.adjustPriceByUtilization(params, price, isBuy);
    let minPremium = new BigNumber(params.minPremium).div(1e18);
    // check minimum premium (if buy)
    if (isBuy && price.lt(minPremium)) {
      price = minPremium;
    }

    // calculate fee
    let fee = params.spot.times(params.spotFee).div(1e18).plus(price.times(params.optionFee).div(1e18));
    if (!isBuy && fee.gt(price)) {
      fee = price;
    }

    // calculate final price (considering direction)
    const finalPrice = isBuy ? price.times(-1) : price;
    const finalFee = fee.times(-1);
    return [finalPrice, finalFee];
  }
  adjustPriceByUtilization(params, price, isBuy) {
    if (params.available.gt(params.equity)) {
      params.available = params.equity;
    }
    if (params.available.lte(0)) {
      return isBuy ? price.times(2) : price.div(2);
    }
    let utilization = UNIT.minus(params.available.times(UNIT).div(params.equity));
    let utilizationAfter;
    if (isBuy) {
      const maxRisk = params.size.times(params.spot);
      const initialMarginChange = maxRisk.times(params.initialMarginRiskRate).div(UNIT);
      utilizationAfter = params.available.minus(initialMarginChange);
    } else {
      const value = price.times(params.size);
      utilizationAfter = params.available.plus(value);
    }
    utilizationAfter = utilizationAfter.gte(0) ? UNIT.minus(utilizationAfter.times(UNIT).div(params.equity)) : UNIT;
    let utilizationAdjust;
    if (utilization.lt(params.priceRatioUtilization) && utilizationAfter.gt(params.priceRatioUtilization)) {
      const area1 = this.getArea(new BigNumber(0), new BigNumber(0), params.priceRatioUtilization, params.priceRatio, utilization.plus(params.priceRatioUtilization).div(2), params.priceRatioUtilization.minus(utilization));
      const area2 = this.getArea(params.priceRatioUtilization, params.priceRatio, UNIT, params.priceRatio2, params.priceRatioUtilization.plus(utilizationAfter).div(2), utilizationAfter.minus(params.priceRatioUtilization));
      utilizationAdjust = area1.plus(area2).div(UNIT).div(utilizationAfter.minus(utilization));
    } else {
      utilization = utilization.plus(utilizationAfter).div(2);
      if (utilization.gte(params.priceRatioUtilization)) {
        utilizationAdjust = this.getY(params.priceRatioUtilization, params.priceRatio, UNIT, params.priceRatio2, utilization);
      } else {
        utilizationAdjust = this.getY(new BigNumber(0), new BigNumber(0), params.priceRatioUtilization, params.priceRatio, utilization);
      }
    }
    utilizationAdjust = utilizationAdjust.div(UNIT).plus(1);
    utilizationAdjust = BigNumber.minimum(utilizationAdjust, new BigNumber(2));
    utilizationAdjust = BigNumber.maximum(utilizationAdjust, new BigNumber(0.5));
    return isBuy ? price.times(utilizationAdjust) : price.div(utilizationAdjust);
  }
  getY(x1, y1, x2, y2, x) {
    return y2.minus(y1).times(UNIT).div(x2.minus(x1)).times(x.minus(x1)).div(UNIT).plus(y1);
  }
  getArea(x1, y1, x2, y2, x, w) {
    return this.getY(x1, y1, x2, y2, x).times(w).div(UNIT);
  }
}