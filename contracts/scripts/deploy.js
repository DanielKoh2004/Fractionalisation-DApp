require('dotenv').config();
const hre = require('hardhat');

async function main() {
  // Clean + compile to ensure artifacts exist when running via node
  await hre.run('clean');
  await hre.run('compile');
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying with:', deployer.address);

  // Deploy Registry
  const Registry = await hre.ethers.getContractFactory('PropertyRegistry');
  const registry = await Registry.deploy(deployer.address);
  await registry.waitForDeployment();
  console.log('PropertyRegistry:', await registry.getAddress());

  // Deploy Marketplace
  const Marketplace = await hre.ethers.getContractFactory('Marketplace');
  const marketplace = await Marketplace.deploy(deployer.address, await registry.getAddress());
  await marketplace.waitForDeployment();
  console.log('Marketplace:', await marketplace.getAddress());

  // Transfer registry ownership to marketplace so it can createProperty
  const txOwn = await registry.transferOwnership(await marketplace.getAddress());
  await txOwn.wait();
  console.log('Transferred registry ownership to Marketplace');

  // Example: create a property (optional demo)
  // const tx = await marketplace.createProperty(
  //   'Damansara Villa Shares',
  //   'DMNS',
  //   'ipfs://example-metadata',
  //   100000,
  //   hre.ethers.parseEther('0.01'),
  //   deployer.address
  // );
  // await tx.wait();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
