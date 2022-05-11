// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.9;


import "erc721a/contracts/ERC721A.sol";
import '@openzeppelin/contracts/access/Ownable.sol';



contract PortifyNFT is ERC721A, Ownable {
    event Purchase(address indexed user, uint count);

    uint constant public MAX_TOTAL_SUPPLY = 500;
    uint public NFT_price = 0.2 ether;
    uint public max_nfts_per_user = 3;
    uint32 public sale_start;
    address public beneficiary;
    string baseUri;

    constructor(
        string memory name,
        string memory symbol,
        uint32 _sale_start,
        address _beneficiary,
        string memory _baseUri
    ) ERC721A(name, symbol) {
        require (_sale_start > block.timestamp, "PortifyNFT::constructor:: bad start time");

        sale_start = _sale_start;
        beneficiary = _beneficiary;
        baseUri = _baseUri;
    }

    function setSaleStart(uint32 new_start) external onlyOwner {
        sale_start = new_start;
    }

    function setPrice(uint new_price) external onlyOwner {
        NFT_price = new_price;
    }

    function setMaxNFTsPerUser(uint new_limit) external onlyOwner {
        max_nfts_per_user = new_limit;
    }

    function setBeneficiary(address _new_beneficiary) external onlyOwner {
        beneficiary = _new_beneficiary;
    }

    function setBaseUri(string calldata _baseUri) external onlyOwner {
        baseUri = _baseUri;
    }

    function mintByOwner(address user, uint count) external onlyOwner {
        require (totalSupply() + count <= MAX_TOTAL_SUPPLY, "PortifyNFT::buyNFTs:: max supply reached");

        _mint(user, count);
    }

    function buyNFTs(uint count) external payable {
        require (block.timestamp >= sale_start, "PortifyNFT::buyNFTs:: sale not started");
        require (totalSupply() + count <= MAX_TOTAL_SUPPLY, "PortifyNFT::buyNFTs:: max supply reached");
        require (_numberMinted(msg.sender) + count <= max_nfts_per_user, "PortifyNFT::buyNFTs:: max nfts per user");
        require (msg.value >= count * NFT_price, "PortifyNFT::buyNFTs:: not enough ethers for purchase");

        _mint(msg.sender, count);
        emit Purchase(msg.sender, count);

        uint change = msg.value - count * NFT_price;
        if (change > 0) {
            payable(msg.sender).transfer(change);
        }

        payable(beneficiary).transfer(msg.value);
    }

    function mintedByUser(address user) external view returns (uint) {
        return _numberMinted(user);
    }

    function _baseURI() internal view override returns (string memory) {
        return baseUri;
    }
}
