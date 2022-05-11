const name = "Byte Me";
const symbol = "Byte";
const start = Math.floor(Date.now() / 1000) + 300;


module.exports = async ({getNamedAccounts, deployments}) => {
    const {deployer} = await getNamedAccounts();

    await deployments.deploy('PortifyNFT', {
        from: deployer,
        log: true,
        args: [
            name, symbol, start, deployer, ''
        ]
    });
};
module.exports.tags = ['nft'];
