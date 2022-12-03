/*
  connectWallet: Connects the MetaMask wallet
*/
import TronWeb from "tronweb";
import { getMinimalAddress } from "../Utilities";


const tronPrivateKey =
  "9c0bebe2250a767277e0cd5d849d9de28e7bf6353c45b198af6174f355a80ca6";

export const tronConnect = async () => {
  try {
    //      debugger;
    let tronlink = await window.tronLink;
    if (!tronlink) {
      // alert("Please Install tronlink First ");
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


export async function getCurrentConnectedOwner(
  Blockchain,
  NetworkChain,
  web3ModalRef,
  setter
) {
  let user = null;
  if (Blockchain == "tron") {
    user = await tronConnect();
    return user;
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
