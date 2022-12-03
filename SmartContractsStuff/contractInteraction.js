import { Contract } from "ethers/lib";
import { getProviderOrSigner } from "./accountsConnect";
import {
  whitelistContractABI,
  WebsiteRentABI,
  WebsiteRentAddress,
  getBlockchainSpecificWebsiteRentContract,
  getTronWebsiteRentContract,
} from "./contractMetdadata";

export const getWebsiteRentContract = async (
  Blockchain,
  networkChain,
  web3ModalRef
) => {
  if (Blockchain == "ethereum") {
    let provider = await getProviderOrSigner(web3ModalRef);
    const websiteRentContract = new Contract(
      WebsiteRentAddress,
      WebsiteRentABI,
      provider
    );
    return websiteRentContract;
  } else if (Blockchain == "tron") {
  } else {
    //
  }
};
export const getEthWhitelistContract = async (
  Blockchain,
  NetworkChain,
  web3ModalRef,
  contractAddress
) => {
  let signer = await getProviderOrSigner(web3ModalRef, true);
  const whitelistContract = new Contract(
    contractAddress,
    whitelistContractABI,
    signer
  );
  return whitelistContract;
};

export async function getCollectionURIs(
  Blockchain,
  NetworkChain,
  web3ModalRef,
  contract
) {
  let _totalSupply =
    Blockchain == "tron"
      ? await contract.totalSupply().call()
      : await contract.totalSupply();
  let numNFTsToFetch = 0;
  numNFTsToFetch = parseInt(_totalSupply);
  let baseURIs = [];

  console.log("Obtaining ", numNFTsToFetch, " NFTs");
  let baseUri =
    Blockchain == "tron"
      ? await contract.baseURI().call()
      : await contract.baseURI();
  if (baseUri.toString().endsWith("/")) {
    baseUri = baseUri.slice(0, -1);
  }
  for (let index = 0; index < numNFTsToFetch; index++) {
    let tokenuri = baseUri + `/${index + 1}.json`;
    baseURIs.push(tokenuri);
  }
  // console.log("base uris are ", baseURIs);
  return baseURIs;
}
function noDeployment(adr) {
  if (!adr || adr?.toString().endsWith("00000000000")) return true;

  return false;
}

export async function getCurrentDeployment(
  Blockchain,
  NetworkChain,
  web3ModalRef,
  websiteURL
) {
  console.log("inside getting current deployment");
  
  let contract = await getTronWebsiteRentContract(NetworkChain);
  console.log("contract is ", contract);
  let _currentDeployment = null;
  console.log("checking Deployment of _" + websiteURL + "_");
  _currentDeployment = await contract.websiteToDeployment(websiteURL).call();
  
   //   console.log("curremt deployment", _currentDeployment);
  if (noDeployment(_currentDeployment)) {
    console.log("No deployment");
    return null;
  }

  let rentTime = await contract.rentTime(websiteURL).call()
      

  let jsEpochRentTime = parseInt(rentTime * 1000);

  let currentTime = new Date().getTime();
  if (jsEpochRentTime <= currentTime) {
    _currentDeployment = null;
  }
  return { currentDeployment: _currentDeployment, rentTime };
}
