import { blackScholes } from "black-scholes";

export class BlackScholesSimple {
  getPrice(isCall, expiry, timeToExpirySeconds, volatility, spot, strike, rate) {
    const timeToExpiryYears = timeToExpirySeconds / (365 * 24 * 60 * 60);
    
    try {
      const result = blackScholes(
        Number(spot),          // spot price
        Number(strike),        // strike price
        timeToExpiryYears,     // expiry time (years)
        Number(volatility),    // volatility
        Number(rate),          // risk-free rate
        isCall ? "call" : "put" // option type
      );

      if (isNaN(result)) {
        throw new Error("Black-Scholes calculation returned NaN");
      }

      return result;
    } catch (error) {
      console.error("Black-Scholes calculation error:", error);
      throw error;
    }
  }
}
