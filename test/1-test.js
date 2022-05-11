const { expectRevert, expectEvent, time, BN} = require('@openzeppelin/test-helpers');
const { evmMine, evmIncreaseTime } = require("./utils");


const PortifyNFT = artifacts.require('PortifyNFT');


contract('Portify NFT test', ([alice, bob, beneficiary, owner]) => {
    it("Deploy NFT contract", async () => {
        this.nft = await PortifyNFT.new('PFYNft', 'PFY', '4294967295', beneficiary, "base_uri", { from: owner });
    });

    it("Alice try to buy NFT before sale start", async () => {
        await expectRevert(this.nft.buyNFTs(3, { from: alice }), "PortifyNFT::buyNFTs:: sale not started");
    });

    it("Set new start time", async () => {
        await this.nft.setSaleStart(0, {from: owner});
        const start = await this.nft.sale_start();
        assert.equal(start.toString(), '0');
    });

    it('Alice buys MAX nfts', async () => {
        const price = await this.nft.NFT_price();
        this.nft.buyNFTs(3, { from: alice, value: price.muln(3).toString() });
    });

    it('Alice try to buy more nfts in 2nd tx', async () => {
        const price = await this.nft.NFT_price();
        await expectRevert(this.nft.buyNFTs(3, { from: alice, value: price.muln(3).toString() }), "PortifyNFT::buyNFTs:: max nfts per user");
    });

    it('Bob trying to buy nfts with low ethers', async () => {
        await expectRevert(this.nft.buyNFTs(3, { from: bob, value: '0'}), "PortifyNFT::buyNFTs:: not enough ethers for purchase");
    });

    it('Cant mint more then max supply', async () => {
        const price = await this.nft.NFT_price();
        // set big limit so that we can reach it fast
        await this.nft.setMaxNFTsPerUser(1000, { from: owner });
        await expectRevert(this.nft.buyNFTs(500, { from: alice, value: price.muln(500).toString()}), "PortifyNFT::buyNFTs:: max supply reached");
    });
});