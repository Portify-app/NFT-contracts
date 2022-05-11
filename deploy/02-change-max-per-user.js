module.exports = async ({getNamedAccounts, deployments}) => {
    const {deployer} = await getNamedAccounts();

    await deployments.execute('PortifyNFT', {
        from: deployer,
        log: true
    }, 'setMaxNFTsPerUser', '100');
};
module.exports.tags = ['max_per_user'];
