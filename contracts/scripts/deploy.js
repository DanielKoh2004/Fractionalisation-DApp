const hre = require("hardhat");

async function main() {
  const Token = await hre.ethers.getContractFactory("FractionalOwnership");
  const token = await Token.deploy();                    // no constructor args
  await token.waitForDeployment();
  console.log("Deployed to:", await token.getAddress());
}

main().catch((e)=>{ console.error(e); process.exitCode = 1; });
