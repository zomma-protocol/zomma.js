import axios from "axios";

const BASE_URL = "https://arb-api.zomma.pro/api/main/v1";

async function getExpiries(marketName) {
  const response = await axios.get(`${BASE_URL}/markets/${marketName}/expiries`);
  return response.data.expiries;
}

async function getStrikes(marketName, expiry) {
  const response = await axios.get(
    `${BASE_URL}/markets/${marketName}/expiries/${expiry}/strikes`
  );
  return response.data.strikes;
}

export { getExpiries, getStrikes };