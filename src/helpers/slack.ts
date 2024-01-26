import axios from "axios";
import dotenv from 'dotenv';
dotenv.config();

export const sendSlackMessage = async (message: string) => {
    const url = process.env.SLACK_WEBHOOK_URL;
    if (!url) {
        throw new Error("SLACK_WEBHOOK_URL is not defined");
    }
    const response = await axios.post(url, { text: message });
    return response;
}

export const sendLowBalanceAlert = async (balance: string, explorerUrl: string) => {
    const url = process.env.SLACK_WEBHOOK_URL;
    if (!url) {
        throw new Error("SLACK_WEBHOOK_URL is not defined");
    }
    const response = await axios.post(url, {
        blocks: [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "Funder Low On Balance",
                }
            },
            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": `*Current Balance:*\n${balance}`
                    },
                    {
                        "type": "mrkdwn",
                        "text": `*Contract:*\n<${explorerUrl}>`
                    }
                ]
            }
        ]
    });
    return response;
}