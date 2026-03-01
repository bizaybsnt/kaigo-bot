const appId = "c61d795dbfb54be1ad6e2af647dea12a";
const customerId = "4e44339bc99c45399ec5cfb2049cf6e3";
const customerSecret = "0ccb36c8f7504a1cafa7264e7fbd3690";
const channelName = "test";

const authHeader = `Basic ${Buffer.from(`${customerId}:${customerSecret}`).toString('base64')}`;
console.log("Auth header:", authHeader);

fetch(`https://api.agora.io/v1/projects/${appId}/rtsc/speech-to-text/builderTokens`, {
    method: 'POST',
    headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ instanceId: channelName }),
})
.then(res => Promise.all([res.status, res.text()]))
.then(([status, text]) => {
    console.log("Status:", status);
    console.log("Body:", text);
})
.catch(console.error);
