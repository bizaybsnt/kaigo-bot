const https = require('https');

const appId = "c61d795dbfb54be1ad6e2af647dea12a";
const customerId = "4e44339bc99c45399ec5cfb2049cf6e3";
const customerSecret = "0ccb36c8f7504a1cafa7264e7fbd3690";
const channelName = "test";

const authHeader = `Basic ${Buffer.from(`${customerId}:${customerSecret}`).toString('base64')}`;

const data = JSON.stringify({
    languages: ["en-US"],
    maxIdleTime: 60,
    rtcConfig: {
        channelName: channelName,
        subBotUid: "101",
        pubBotUid: "102"
    }
});

const req = https.request(`https://api.agora.io/api/speech-to-text/v1/projects/${appId}/join`, {
    method: 'POST',
    headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
}, (res) => {
    console.log('Status:', res.statusCode);
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => console.log('Body:', body));
});

req.on('error', console.error);
req.write(data);
req.end();
