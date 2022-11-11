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
  getWhitelistContract,
} from "../SmartContractsStuff/contractInteraction";
import { getTokensMetaData } from "../SmartContractsStuff/IpfsInteraction";
import ShowNFTs from "./ShowNFTs";

let myUrlAddress = "https://theWhitelister.vercel.app";
//
let websiteType = "whitelist";
// let Blockchain = "ethereum";
// let NetworkChain = "goerli";
let Blockchain = "ethereum";
let NetworkChain = "goerli";

export default function Home() {
  const [currentpage, setCurrentPage] = useState("home");
  const { isConnected, isDisconnected, address } = useAccount();
  const [currentDeployment, setCurrentDeployment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [brandName, setBrandName] = useState(null);
  const [whitelistStartTime, setWhitelistStartTime] = useState(0);
  const [whitelistEndTime, setWhitelistEndTime] = useState(0);
  const [isCurrentUserWhitelisted, setIsCurrentUserWhitelisted] =
    useState(false);
  const [NFTs, setNFTs] = useState([]);

  const web3ModalRef = useRef();

  async function fetchCollection(deploymentAddress) {
    if (!isConnected) return null;
    // console.log("making a sale contract ");
    let whitelistContract = await getWhitelistContract(
      Blockchain,
      NetworkChain,
      web3ModalRef,
      deploymentAddress
    );
    // console.log("sale contract is ", whitelistContract);
    let _name = await whitelistContract.name();

    let isWhitelisted = await whitelistContract.isWhitelisted(address);
    if (isWhitelisted) setIsCurrentUserWhitelisted(true);
    let _whitelistingEndTime = await whitelistContract.endTime();
    _whitelistingEndTime = parseInt(_whitelistingEndTime) * 1000;
    setWhitelistEndTime(_whitelistingEndTime);
    let _whitelistingStartTime = await whitelistContract.startTime();
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
      web3ModalRef,
      myUrlAddress
    );
    if (!_currentDeployment) return null;
    return _currentDeployment.currentDeployment;
  }

  async function init() {
    if (!address) {
      return null;
    }
    let deploymentAddress = await fetchDeployment();
    // console.log("inside index", deploymentAddress);
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
    if (web3ModalRef.current === undefined) {
      web3ModalRef.current = new Web3Modal({
        network: NetworkChain,
        providerOptions: {},
        disableInjectedProvider: false,
      });
    }

    init();
  }, [isConnected]);
  // console.log("NFTs are ", NFTs);

  return (
    <div
      style={{
        height: "100vh",
        background: "black",
      }}
    >
      <Navbar
        image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQr7ZZQwTn5ClB5v8hOJTehixgGs5csluH-8WIUQEB2rdEaFFzXWOoXY4oOGK09US2CAdY&usqp=CAU"
        brandName={brandName ? brandName : "whitelister"}
        func={setCurrentPage}
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
          {!isConnected
            ? "Connect Wallet First"
            : loading && !brandName
            ? "Loading Hosted Collection's details"
            : brandName
            ? brandName + " NFTs are coming.."
            : "Whitelister is not rented for any wshitelisting yet"}
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
