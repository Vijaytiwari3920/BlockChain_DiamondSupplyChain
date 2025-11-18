const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DiamondSupplyChainModule", (m) => {

  const simpleContract = m.contract("DiamondSupplyChain");

  return { simpleContract };
});