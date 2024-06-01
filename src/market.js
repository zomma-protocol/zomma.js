import axios from "axios";

const BASE_URL = "https://api-v1.zomma.pro/api/main/v1";

async function getExpiries(market) {
  const response = await axios.get(`${BASE_URL}/markets/${market}/expiries`);
  return response.data.expiries;
}

async function getStrikes(market, expiry) {
  const response = await axios.get(
    `${BASE_URL}/markets/${market}/expiries/${expiry}/strikes`
  );
  return response.data.strikes;
}

export { getExpiries, getStrikes };