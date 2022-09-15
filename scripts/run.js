const hre = require('hardhat')

const main = async () => {
  const [owner] = await hre.ethers.getSigners()
  const taskPortalContractFactory = await hre.ethers.getContractFactory('TaskPortal')
  const taskPortalContract = await taskPortalContractFactory.deploy()
  await taskPortalContract.deployed()

  console.log('Contract deployed to:', taskPortalContract.address)
  console.log('Contract deployed by:', owner.address)
}

const runMain = async () => {
  try {
    await main()
    process.exit(0) // exit Node process without error
  } catch (error) {
    console.log(error)
    process.exit(1) // exit Node process while indicating 'Uncaught Fatal Exception' error
  }
  // Read more about Node exit ('process.exit(num)') status codes here: https://stackoverflow.com/a/47163396/7974948
}

runMain()
