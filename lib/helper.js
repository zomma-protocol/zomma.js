export function toDecimal(value, decimal = 18) {
  return new BigNumber(value).times(new BigNumber(10).pow(decimal));
}
export function fromDecimal(value, decimal = 18) {
  return new BigNumber(value.toString()).div(new BigNumber(10).pow(decimal));
}
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
export function abs(n) {
  return n < 0n ? -n : n;
}
;