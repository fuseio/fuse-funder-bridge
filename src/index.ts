import express from 'express';
import { initFuseSDK } from './helpers/fusesdk';
import dotenv from 'dotenv';
dotenv.config();
const app = express();


app.listen(4000, () => {
  initFuseSDK()
  console.log(`server running on port 4000`);
});