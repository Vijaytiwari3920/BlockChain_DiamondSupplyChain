async function main() {
    const clientVersion = await hre.network.provider.send("web3_clientVersion");
    console.log("iitbhilaiBlockchain Software Version running on http://10.10.0.60:8550: ", clientVersion); 
}

main()