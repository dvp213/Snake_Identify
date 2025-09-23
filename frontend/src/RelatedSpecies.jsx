import React from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";
import catSnakeImg from "./assets/catSnakeImg.jpg";
import wolfSnakeImg from "./assets/wolfSnakeImg.jpg";

function RelatedSpecies() {
  const navigate = useNavigate();

  return (
    <div className="related-page">
      {/* Back button + Title outside */}
      <div className="related-header">
        <button
          className="back-button4"
          onClick={() => navigate("/details")}
        >
          Go back
        </button>
      </div>
<h1 className="related-title">
          Related Species{" "}
          <span className="related-subtitle">(Similar to Bungarus caeruleus)</span>
        </h1>
      {/* Container for species boxes */}
      <div className="related-container">

        {/* Species 1 */}
        <div className="species-box">
          <div className="species-details">
            <h3 >
              Ceylon Cat Snake{" "}
              <span className="italic">(Boiga ceylonensis)</span>
            </h3>
            <p>
              The Ceylon Cat Snake (Boiga ceylonensis) is an endemic species found only in Sri Lanka. It is a slender, nocturnal, mildly venomous colubrid that primarily inhabits forests, home gardens, and cultivated areas. Its body is usually brown to reddish-brown with faint crossbands, giving it a superficial resemblance to kraits, which often leads to misidentification. Although rear-fanged and mildly venomous, it poses little threat to humans, with its venom being effective mainly on small prey such as lizards, frogs, and geckos.
            </p>
          </div>
          <div className="species-image">
            <img src={catSnakeImg} alt="Ceylon Cat Snake" />
          </div>
        </div>

        {/* Species 2 */}
        <div className="species-box">
          <div className="species-details">
            <h3>
              Wolf Snake <span className="italic">(Lycodon aulicus)</span>
            </h3>
            <p>
              The Wolf Snake (Lycodon aulicus) is a non-venomous snake commonly found in Sri Lanka and across South Asia. It is slender with distinctive black-and-white banding, which often causes people to mistake it for the highly venomous krait. Despite its resemblance, the wolf snake is harmless to humans and mainly feeds on lizards, small rodents, and geckos.
            </p>
          </div>
          <div className="species-image">
            <img src={wolfSnakeImg} alt="Wolf Snake" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RelatedSpecies;
