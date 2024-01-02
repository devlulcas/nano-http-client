import { NanoHttpClient } from "nano-http-client";

export const httpClient = new NanoHttpClient({
  baseURL: new URL("http://localhost:3000/api"),
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  }
})
