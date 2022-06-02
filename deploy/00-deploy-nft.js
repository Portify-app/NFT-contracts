const start = Math.floor(Date.now() / 1000) + 300;
const uri = 'ipfs://QmPysu3bzmgH5uuUWp9oeWACcwA5vT1xd2RmpvCjbbLAdd/';


module.exports = async ({getNamedAccounts, deployments}) => {
    const {deployer} = await getNamedAccounts();

    await deployments.deploy('PortifyNFT', {
        from: deployer,
        log: true,
        args: [
            start, deployer, uri
        ]
    });
};
module.exports.tags = ['nft'];
