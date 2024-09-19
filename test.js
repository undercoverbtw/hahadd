const axios = require('axios');

async function testProxy(proxy) {
    try {
        const response = await axios.get("http://httpbin.org/ip", {
            proxy,
            timeout: 5000
        });
        if (response.status === 200) {
            console.log(`Proxy %O is working. Your IP: ${response.data.origin}`, proxy);
        } else {
            console.log(`Proxy %O returned status code ${response.status}`, proxy);
        }
    } catch (error) {
        console.log(`Error occurred while testing proxy %O: ${error.message}`, proxy);
    }
}

async function main() {
    const proxy = {
        host: 'proxy.toolip.io',
        port: '_port_',
        auth: {username: '8c5906b99fbd1c0bcd0f916d545c565ae81b604736435265b767d885a09cd1c5494da4fd86d192b8bf7df0dd1415f735-country-XX-session-###', password: 'wn1k0xg25fxa'},
    };
    await testProxy(proxy);
}

main();
