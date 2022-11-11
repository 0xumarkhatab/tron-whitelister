/*
  connectWallet: Connects the MetaMask wallet
*/
import { BigNumber, Contract, ethers, providers, utils } from "ethers";
import TronWeb from "tronweb";
import { getMinimalAddress } from "../Utilities";

export const connectWallet = async () => {
  try {
    // Get the provider from web3Modal, which in our case is MetaMask
    // When used for the first time, it prompts the user to connect their wallet
    await getProviderOrSigner();
    //          setWalletConnected(true);
  } catch (err) {
    console.error(err);
  }
};

/**
 * Returns a Provider or Signer object representing the Ethereum RPC with or without the
 * signing capabilities of metamask attached
 *
 * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
 *
 * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
 * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
 * request signatures from the user using Signer functions.
 *
=       */
export const getProviderOrSigner = async (web3ModalRef, needSigner = false) => {
  // Connect to Metamask
  // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
  try {
    console.log("web3 modal is ",web3ModalRef)
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Mumbai network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Please Change the network to Goerli");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  } catch (e) {
    console.log("User is not connected");
  }
};



const tronPrivateKey =
  "9c0bebe2250a767277e0cd5d849d9de28e7bf6353c45b198af6174f355a80ca6";

export const tronConnect = async () => {
  try {
    //      debugger;
    let tronlink = await window.tronLink;
    if (!tronlink) {
      alert("Please Install tronlink First ");
      return null;
    }

    await tronlink.request({ method: "tron_requestAccounts" });

    let tronWeb = await tronlink?.tronWeb;
    if (tronWeb == false) return null;
    let address = tronWeb.defaultAddress;
    return address.base58;
  } catch (err) {
    console.log("Error: ", err);
    alert("Error: TronLink extension is not installed");
  }
};

async function getTronwebShasta() {
  const HttpProvider = TronWeb.providers.HttpProvider;
  const fullNode = new HttpProvider("https://api.shasta.trongrid.io");
  const solidityNode = new HttpProvider("https://api.shasta.trongrid.io");
  const eventServer = new HttpProvider("https://api.shasta.trongrid.io");
  const tronWeb = new TronWeb(
    fullNode,
    solidityNode,
    eventServer,
    tronPrivateKey
  );
  return tronWeb;
}
export function getNileTronWeb() {
  const HttpProvider = TronWeb.providers.HttpProvider;
  const fullNode = new HttpProvider("https://api.nileex.io/");
  const solidityNode = new HttpProvider("https://api.nileex.io/");
  const eventServer = new HttpProvider("https://event.nileex.io/");
  const privateKey =
    "9c0bebe2250a767277e0cd5d849d9de28e7bf6353c45b198af6174f355a80ca6";
  let tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
  // console.log("returning tron nile web", tronWeb);
  return tronWeb;
}

async function getTronwebMainnet() {}

export async function getNetworkTronweb(network) {
  let Network = network.toString().toLowerCase();
  switch (Network) {
    case "shasta":
      return getTronwebShasta();
    case "nile":
      let trwb = await getNileTronWeb();
      // console.log("Network returns ", trwb);
      return trwb;
    case "mainnet":
      return getTronwebMainnet();

    default:
      break;
  }
}

export async function deploy_tron_contract(
  network,
  abi,
  bytecode,
  parameters,
  statusUpdater,
  SuccessFallback
) {
  try {
    let tronWeb = await getNetworkTronweb(network);
    console.log("tronweb inside deploy ", tronWeb);
    statusUpdater("Creting contract instance..");
    statusUpdater("Deploying your smart contract");
    console.log("paramters received ", parameters);
    let contract_instance = await tronWeb.contract().new({
      abi: abi,
      bytecode: bytecode.object,
      feeLimit: 1000000000,
      callValue: 0,
      userFeePercentage: 1,
      originEnergyLimit: 10000000,
      parameters: parameters,
      shouldPollResponse: true,
    });
    let scAddress = contract_instance.address;
    statusUpdater("Deployed Successfully 🥳 ");
    let contract = await tronWeb.contract().at(scAddress);
    console.log(contract);
    let name = await contract.name().call();
    statusUpdater(
      name + " is deployed to address := " + getMinimalAddress(scAddress)
    );
    let currentConnectedUser = await tronConnect();
    SuccessFallback(scAddress, currentConnectedUser);
    return scAddress;
  } catch (e) {
    console.log("error : ", e);
  }
}


export async function getCurrentConnectedOwner(
  Blockchain,
  NetworkChain,
  web3ModalRef,
  setter
) {
  let user = null;
  if (Blockchain == "tron") {
    user = await tronConnect();
  } else if (Blockchain == "ethereum" || Blockchain == "polygon") {
    let signer = await getProviderOrSigner(NetworkChain, web3ModalRef);
    if (!signer) {
      setter(null);
      return null;
    }
    user = await signer?.getAddress();
  }
  if (setter) {
    setter(user);
  }
  return user;
}
