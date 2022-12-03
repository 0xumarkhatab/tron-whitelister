import React, { useEffect, useRef, useState } from "react";
import navstyle from "../styles/Navbar.module.css";
import { getMinimalAddress } from "../Utilities";
import { getCurrentConnectedOwner } from "../SmartContractsStuff/accountsConnect";
// let Blockchain="ethereum";
// let NetworkChain="goerli";
let Blockchain = "tron";
let NetworkChain = "shasta";

export default function Navbar(props) {
  let connectWallet = props.connectWallet;
  let connectedAddress = props.connectedAddress;
console.log("connected address is ",connectedAddress)
  const [connectedWallet, setConnectedWallet] = useState(connectedAddress);
  let brandName = props.brandName;
  let web3ModalRef = useRef();
  const homepage = () => {
    console.log("call home page");
    props.func("home");
  };
  const whitelist = () => {
    console.log("call whitelisting page");
    props.func("whitelist");
  };
  const about = () => {
    console.log("call about page");
    props.func("about");
  };

  useEffect(() => {
    getCurrentConnectedOwner(
      Blockchain,
      NetworkChain,
      web3ModalRef,
      setConnectedWallet
    );
  }, []);

  return (
    <>
      <div className={navstyle.maincontainer}>
        <div className={navstyle.container1}>
          <img src={props.image} alt="icon" className={navstyle.image} />
          <p>{brandName}</p>
        </div>
        <div className={navstyle.container2}>
          <button className={navstyle.button} onClick={homepage}>
            Home
          </button>
          <button className={navstyle.button} onClick={whitelist}>
            Whitelisting
          </button>
          <button className={navstyle.button} onClick={about}>
            About
          </button>
        </div>
        <div className={navstyle.container3}>
          <button
            style={{
              padding: "10px",
              fontSize: "18px",
              background: connectedWallet ? "	#00ffbf" : "white",

              borderRadius: "20px",
              color: "black",
              cursor: "pointer",
            }}
            onClick={connectWallet}
          >
            {connectedWallet ? (
              getMinimalAddress(connectedAddress,true)
            ) : (
              <p>Connect</p>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
Navbar.proptype;
