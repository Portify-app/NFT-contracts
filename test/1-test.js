const { expectRevert, expectEvent, time, BN} = require('@openzeppelin/test-helpers');
const { evmMine, evmIncreaseTime } = require("./utils");
const {ethers} = require("ethers");


const PortifyNFT = artifacts.require('PortifyNFT');


contract('Portify NFT test', ([alice, bob, karl, beneficiary, owner]) => {
    it("Deploy NFT contract", async () => {
        this.nft = await PortifyNFT.new('4294967295', beneficiary, "base_uri", { from: owner });
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
        const balance_before = new BN(await web3.eth.getBalance(beneficiary));
        const price = await this.nft.NFT_price();
        await this.nft.buyNFTs(3, { from: alice, value: price.muln(3).toString() });
        const balance_after = new BN(await web3.eth.getBalance(beneficiary));
        const delta = balance_after.sub(balance_before);
        expect(delta.toString()).to.be.eq(price.muln(3).toString());
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

    it('Check reserved mechanic', async () => {
       const cur_supply = await this.nft.totalSupply();
       const price = await this.nft.NFT_price();

       // reserve 2 nfts for bob
       await this.nft.setReserved([bob], [2], { from: owner });
       const reserved = await this.nft.reserved_num();
        const res = await this.nft.reserved_minters(bob);
        expect(reserved.toString()).to.be.eq('2', 'Not reserved');
        expect(res.toString()).to.be.eq('2', 'Not reserved');

       // alice try to buy including reserved, but fail
        await expectRevert(this.nft.buyNFTs(497, { from: alice, value: price.muln(500).toString()}), "PortifyNFT::buyNFTs:: max supply reached");

        // bob buys his reserved nfts + 1 nft more
        await this.nft.buyNFTs(3, { from: bob, value: price.muln(3).toString() });
        const reserved2 = await this.nft.reserved_num();
        expect(reserved2.toString()).to.be.eq('0', 'Not reserved');
        const res2 = await this.nft.reserved_minters(bob);
        expect(res2.toString()).to.be.eq('0', 'Not reserved');
    });

    it('Check free mint mechanic', async () => {
        const price = await this.nft.NFT_price();
        const cur_supply = await this.nft.totalSupply();

        await this.nft.setFreeMinters([karl], [2], { from: owner });
        const reserved = await this.nft.reserved_num();
        const res = await this.nft.free_minters(karl);
        expect(reserved.toString()).to.be.eq('2', 'Not reserved');
        expect(res.toString()).to.be.eq('2', 'Not reserved');

        const buy_all = 500 - cur_supply.toNumber();
        // try buy everything including reserved
        await expectRevert(this.nft.buyNFTs(buy_all, { from: alice, value: price.muln(500).toString()}), "PortifyNFT::buyNFTs:: max supply reached");

        // buy free
        await this.nft.buyNFTs(1, { from: karl });
        const reserved2 = await this.nft.reserved_num();
        const res2 = await this.nft.free_minters(karl);
        expect(reserved2.toString()).to.be.eq('1', 'Not reserved');
        expect(res2.toString()).to.be.eq('1', 'Not reserved');

        // buy both free, fail
        await expectRevert(this.nft.buyNFTs(2, { from: karl }), "PortifyNFT::buyNFTs:: not enough ethers for purchase");

        // 1 free and pay for 1
        await this.nft.buyNFTs(2, { from: karl, value: price.muln(1).toString() });
        const reserved3 = await this.nft.reserved_num();
        const res3 = await this.nft.free_minters(karl);
        expect(reserved3.toString()).to.be.eq('0', 'Not reserved');
        expect(res3.toString()).to.be.eq('0', 'Not reserved');
    });
});