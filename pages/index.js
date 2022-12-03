import Navbar from "./Navbar";
import Introduction from "./Introduction";
import Whitelist from "./Whitelist";
import About from "./About";
import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import Web3Modal from "web3modal";
import {
  getCollectionURIs,
  getCurrentDeployment,
  getEthWhitelistContract,
} from "../SmartContractsStuff/contractInteraction";
import { getTokensMetaData } from "../SmartContractsStuff/IpfsInteraction";
import ShowNFTs from "./ShowNFTs";
import { getCurrentConnectedOwner } from "../SmartContractsStuff/accountsConnect";
import { getBlockchainSpecificWhitelistContract } from "../SmartContractsStuff/contractMetdadata";

let myUrlAddress = "https://tron-whitelister.vercel.app";
//
let websiteType = "whitelist";
// let Blockchain = "ethereum";
// let NetworkChain = "goerli";
let Blockchain = "tron";
let NetworkChain = "shasta";

export default function Home() {
  const [currentpage, setCurrentPage] = useState("home");
  const [currentDeployment, setCurrentDeployment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [brandName, setBrandName] = useState(null);
  const [whitelistStartTime, setWhitelistStartTime] = useState(0);
  const [whitelistEndTime, setWhitelistEndTime] = useState(0);
  const [isCurrentUserWhitelisted, setIsCurrentUserWhitelisted] =
    useState(false);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [NFTs, setNFTs] = useState([]);

  const web3ModalRef = useRef();

  async function fetchCollection(deploymentAddress) {
    console.log("fetching collection for ",deploymentAddress)
    let whitelistContract = await getBlockchainSpecificWhitelistContract(
      Blockchain,
      NetworkChain,
      web3ModalRef,
      deploymentAddress
    );
    console.log("whitelist contract is ", whitelistContract);
    let _name =
      Blockchain == "tron"
        ? await whitelistContract.name().call()
        : await whitelistContract.name();

    let isWhitelisted =
      Blockchain == "tron"
        ? await whitelistContract.isWhitelisted(connectedWallet).call()
        : await whitelistContract.isWhitelisted(connectedWallet);

    if (isWhitelisted) setIsCurrentUserWhitelisted(true);
    let _whitelistingEndTime =
      Blockchain == "tron"
        ? await whitelistContract.endTime().call()
        : await whitelistContract.endTime();

    _whitelistingEndTime = parseInt(_whitelistingEndTime) * 1000;
    setWhitelistEndTime(_whitelistingEndTime);
    let _whitelistingStartTime =
      Blockchain == "tron"
        ? await whitelistContract.startTime().call()
        : await whitelistContract.startTime();
    _whitelistingStartTime = parseInt(_whitelistingStartTime) * 1000;
    setWhitelistStartTime(_whitelistingStartTime);

    setBrandName(_name);
    let baseURIs = await getCollectionURIs(
      Blockchain,
      NetworkChain,
      web3ModalRef,
      whitelistContract
    );
    console.log("base URIs ", baseURIs);
    await getTokensMetaData(baseURIs, setNFTs, whitelistContract);
    setLoading(false);
  }
  async function fetchDeployment() {

    let _currentDeployment = await getCurrentDeployment(
      Blockchain,
      NetworkChain,
      null,
      myUrlAddress
    );
    if (!_currentDeployment) return null;
    return _currentDeployment.currentDeployment;
  }

  async function init() {
    if (!connectedWallet) {
      connect();
      return null;
    }

    let deploymentAddress = await fetchDeployment();
    deploymentAddress="TQCYoTGXxf6AzTuEepnRtLBaniRueDMF9K"
    console.log("inside index", deploymentAddress);
    console.log("deployment", deploymentAddress);
    if (deploymentAddress != null) {
      await fetchCollection(deploymentAddress);
      setCurrentDeployment(deploymentAddress);
    } else {
      setLoading(false);
    }
  }
  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    // Assign the Web3Modal class to the reference object by setting it's `current` value
    // The `current` value is persisted throughout as long as this page is open
    init();
  }, [connectedWallet]);
  // console.log("NFTs are ", NFTs);
  async function connect() {
    let user = await getCurrentConnectedOwner(
      Blockchain,
      NetworkChain,      
    );
    setConnectedWallet(user);
  }

  return (
    <div
      style={{
        height: "100vh",
        background: "black",
      }}
    >
      <Navbar
        image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQr7ZZQwTn5ClB5v8hOJTehixgGs5csluH-8WIUQEB2rdEaFFzXWOoXY4oOGK09US2CAdY&usqp=CAU"
        brandName={brandName ? brandName : "tron whitelister"}
        func={setCurrentPage}
        connectWallet={connect}
        connectedAddress={connectedWallet}
      />
      {currentDeployment == null ? (
        <div
          style={{
            height: "100vh",
            width: "100vw",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "black",
            color: "white",
            fontSize: "20px",
            fontWeight: "700",
          }}
        >
          {!connectedWallet ? (
            <div
              style={{
                display: "flex",
              }}
            >
              {" "}
              <p
                onClick={connect}
                style={{
                  textDecoration: "underline",
                  marginRight: "5px",
                  cursor: "pointer",
                }}
              >
                Connect Wallet
              </p>
              First
            </div>
          ) : loading && !brandName ? (
            "Loading Hosted Collection's details"
          ) : brandName ? (
            brandName + " NFTs are coming.."
          ) : (
            "Tron Whitelister is not rented by anyone yet"
          )}
        </div>
      ) : (
        <>
          {" "}
          {currentpage === "about" && (
            <About
              heading="About us"
              description="The founder is an integral part of the brand’s origin story, so making her the star of the page works. Think about including additional elements that can strengthen your About Us page.Hello know us."
              discord="https://discord.com/invite/chainlink"
              linkdin="https://www.linkedin.com/in/umarkhatab456"
              email="mailto:seemalfrl@gmail.com"
              twitter="https://twitter.com/umarkhatab465"
            />
          )}
          {currentpage === "whitelist" && (
            <Whitelist
              heading="Get Whitelisted Now"
              text="You will receive a special NFT as part of your membership, and you will be eligible for Early Access. NFTS are limited, and only NFT owners will get Early Access. You can help us create more tools by purchasing a membership. Join our community! Public access will be enabled in the end of 2022."
            />
          )}
          {currentpage === "home" && (
            <div>
              <Introduction
                intro="By getting Whitelisted , you will be availing to our various early access benefits like low prices , team benefits and more . So what are you waiting for ? "
                heading={"Time to Whitelist"}
                image={
                  NFTs.length > 0
                    ? NFTs[0].image
                    : "https://madnfts.io/wp-content/uploads/2022/04/WD-03.png"
                }
              />
              {NFTs.length == 0 ? (
                "Fetching Collections"
              ) : (
                <ShowNFTs
                  isWhitelisted={isCurrentUserWhitelisted}
                  startTime={whitelistStartTime}
                  endTime={whitelistEndTime}
                  contractAddress={currentDeployment}
                  NFTs={NFTs}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
