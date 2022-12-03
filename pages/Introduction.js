import React from "react";
import styles from "../styles/Introduction.module.css";

export default function Introduction(props) {
  let image = props.image;
  const getwhitelisted = () => {
    console.log("whitelisting page");
  };

  return (
    <div className={styles.main__container}>
      <div className={styles.container1}>
        <div className={styles.heading}>
          <h1>{props.heading}</h1>
        </div>
        <div className={styles.intro}>
          <p>{props.intro}</p>
          <div>
            <button className={styles.button} onClick={getwhitelisted}>
              Get Whitelisted
            </button>
          </div>
        </div>
      </div>
      <div className={styles.container2}>
        <img
          className={styles.image}
          src={
            image
              ? image
              : "https://camo.githubusercontent.com/0cbb62ec60fd23643b211d7ed0bb5ade6964f0da12124b95a0a3e7db096768c3/68747470733a2f2f7261772e6769746875622e636f6d2f74756c696f732f706c616365686f6c6465725f7368696d6d65722f6d61737465722f73616d706c652e676966"
          }
          alt="loading collection"
        />
 
//         <img
//           className={styles.image}
//           src={
//             image
//               ? image
//               : "https://the-media-leader.com/wp-content/uploads/2022/07/adobestock-metaverse-resized.png"
//           }
//           alt="bordape"
//         />
      </div>
    </div>
  );
}
