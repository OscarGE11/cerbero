import { fetchJwt } from "./lib/auth.js";

const token = await fetchJwt();
console.log(token);
