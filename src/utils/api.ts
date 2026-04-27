import axios, { type AxiosInstance } from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

type AxiosInstanceWithCookieJar = AxiosInstance & {
  defaults: {
    jar: CookieJar;
    withCredentials: true;
  };
};

const jar = new CookieJar();
const api = wrapper(axios.create({ jar, withCredentials: true })) as AxiosInstanceWithCookieJar;

export default api;
