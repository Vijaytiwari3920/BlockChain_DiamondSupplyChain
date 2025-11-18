require("@nomicfoundation/hardhat-toolbox");

module.exports = {
   solidity: {
    version: "0.8.28", 
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      
      viaIR: true, 
    },
  },
  networks: {
    iitbhilaiBlockchain: {
      url: "http://10.10.0.62:8550",
      chainId: 491002,
      accounts: [
        "04e62696bc403d5ab741bc2ae6a236c321bd11bf50f4664f3ffa6250f8fdf3e7",
        "15f907ad2d601281c22759b56b8797b092abc49b95b026b35e92d1b4f4b37ca9",
        "f36a479fd72b0373def0dd3bdad58e2b1d777e5e53464dbdd59d35ba02c17287",
        "460973999ad9d4c9838d61bbe5070b2c60b6c343af3cdd2c589188da10f6d30e",
        "975f178b9b84fb02ff01975b770be717eca85a8d61f2a125f4cdc0f22fad6c34",
        "fafeb53bf0c17e9d3afd15fe333158ba28d8b576dad6080c49ad0d53f49bc78c",
        "36a4954dcd7d0e64209dddcdb5dc73f0e8916c292443bba03afa11ba2815a036",
        "cdcedb3ea564d9737d1dad4595ef68d80eeaed767662d76e55612fd830140db9",
        "d4b5df44fe5e6ec348b9663ac4377d1e2f71b4117d02b415d5cce1622563c23f",
        "8cab1b5e6cb8cd07944aea53d380f30605c17b3d4ace51487a50bc7c3ba996a7",
        "fa3b6ba2e514832c94228f78238dba29b83a93fe0b8ccfceb8019ce5441ac9ed"
        
      ]
    },
  }
};
