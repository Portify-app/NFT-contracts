module.exports = async ({getNamedAccounts, deployments}) => {
    const {deployer} = await getNamedAccounts();

    await deployments.execute('PortifyNFT', {
        from: deployer,
        log: true
    }, 'setPrice', '1');
};
module.exports.tags = ['price'];
