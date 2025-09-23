import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import snakeImg from "./assets/catSnakeImg.jpg"; 

function AdminCeylonkrait() {
  const navigate = useNavigate();

  // Initial text content
  const [sinhalaText, setSinhalaText] = useState(
    `මුදු කරවලා කුඩා හා සිහින් ය. පැටවුන් බිහි වූ විට, සර්පයාගේ දිග 250 mm (අඟල් 9.8) පමණ වේ. මෙම විශේෂයේ සාමාන්‍ය වැඩිහිටි දිග සෙන්ටිමීටර 75 (අඟල් 29+½) වන අතර ඉහළ සීමාව සෙන්ටිමීටර 90 (අඟල් 35+½) වේ.මොහුගේ කළු පැහැති සමෙහි සුදු පැහැති පටි ලෙස දැකගත හැක. 
    මොහුට අසාමාන්‍ය ලෙස දිගු පෙනහළු ඇති අතර එය කෝපයට පත් වූ විට එය පිම්බේ. මෙම සර්පයාගේ ඉතා ප්‍රබල විෂ මධ්‍යම ස්නායු පද්ධතියට පහර දෙන අතර ක්‍රමයෙන් එය විනාශ කරයි. ශ්වසන පද්ධතිය මර්දනය කළ විට මරණය සිදු වේ. එබැවින්, මෙම සර්පයා දෂ්ට කළ විට වහාම ප්‍රතිකාර කළ යුතුය, එසේ නොමැතිනම් වින්දිතයා පැය 12 ක් ඇතුළත මිය යා හැකිය.`
  );

  const [englishText, setEnglishText] = useState(
    `The Sri Lankan krait is small and slender. On hatching, the length of the snake is about 250 mm (9.8 in). The average adult length for this species is 75 cm (29+½ in) with 90 cm (35+½ in) being the upper limit. Its black skin is crossed with thin white transverse bands. It has an extraordinarily long lung which it inflates when angry. The highly potent venom of this snake attacks the central nervous system and gradually destroys it. Death is caused when the respiratory system is suppressed. Therefore, a bite from this snake should be treated immediately, or else the victim may die within 12 hours.`
  );

  // Edit mode states
  const [editSinhala, setEditSinhala] = useState(false);
  const [editEnglish, setEditEnglish] = useState(false);

  // Related species state (default one card with dummy data)
  const [relatedSpecies, setRelatedSpecies] = useState([
    {
      id: 1,
      image: snakeImg, 
      text: "The Ceylon Cat Snake (Boiga ceylonensis) is an endemic species found only in Sri Lanka. It is a slender, nocturnal, mildly venomous colubrid that primarily inhabits forests, home gardens, and cultivated areas. Its body is usually brown to reddish-brown with faint crossbands, giving it a superficial resemblance to kraits, which often leads to misidentification. Although rear-fanged and mildly venomous, it poses little threat to humans, with its venom being effective mainly on small prey such as lizards, frogs, and geckos.",
      editMode: false,
    },
  ]);
  const [newImage, setNewImage] = useState(null);
  const [newText, setNewText] = useState("");

  // Add related species
  const addRelatedSpecies = () => {
    if (!newImage || !newText) return;
    setRelatedSpecies([
      ...relatedSpecies,
      { id: Date.now(), image: newImage, text: newText, editMode: false },
    ]);
    setNewImage(null);
    setNewText("");
  };

  // Toggle edit mode
  const toggleEdit = (id) => {
    setRelatedSpecies(
      relatedSpecies.map((sp) =>
        sp.id === id ? { ...sp, editMode: !sp.editMode } : sp
      )
    );
  };

  // Update text
  const updateText = (id, value) => {
    setRelatedSpecies(
      relatedSpecies.map((sp) => (sp.id === id ? { ...sp, text: value } : sp))
    );
  };

  // Update image
  const updateImage = (id, file) => {
    if (!file) return;
    const newImageURL = URL.createObjectURL(file);
    setRelatedSpecies(
      relatedSpecies.map((sp) =>
        sp.id === id ? { ...sp, image: newImageURL } : sp
      )
    );
  };

  // Delete species
  const deleteSpecies = (id) => {
    setRelatedSpecies(relatedSpecies.filter((sp) => sp.id !== id));
  };

  return (
    <div className="ceylonkraitadmin-wrapper">
      <button className="back-button" onClick={() => navigate("/Admin")}>
        Go back
      </button>

      <div className="ceylonkraitadmin-content">
        <h1 className="ceylonkraitadmin-title">Ceylonkrait (මුදු කරවලා)</h1>

        {/* Row Container for Sinhala + English */}
        <div className="ceylonkraitadmin-row">
          {/* Sinhala Section */}
          <div className="ceylonkraitadmin-text-container">
            <label>Details in Sinhala:</label>
            {editSinhala ? (
              <>
                <textarea
                  className="ceylonkraitadmin-textarea"
                  value={sinhalaText}
                  onChange={(e) => setSinhalaText(e.target.value)}
                />
                <button
                  className="ceylonkraitadmin-edit-button"
                  onClick={() => setEditSinhala(false)}
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <p>{sinhalaText}</p>
                <button
                  className="ceylonkraitadmin-edit-button"
                  onClick={() => setEditSinhala(true)}
                >
                  Edit
                </button>
              </>
            )}
          </div>

          {/* English Section */}
          <div className="ceylonkraitadmin-text-container">
            <label>Details in English:</label>
            {editEnglish ? (
              <>
                <textarea
                  className="ceylonkraitadmin-textarea"
                  value={englishText}
                  onChange={(e) => setEnglishText(e.target.value)}
                />
                <button
                  className="ceylonkraitadmin-edit-button"
                  onClick={() => setEditEnglish(false)}
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <p>{englishText}</p>
                <button
                  className="ceylonkraitadmin-edit-button"
                  onClick={() => setEditEnglish(true)}
                >
                  Edit
                </button>
              </>
            )}
          </div>
        </div>
<div className="ceylonkraitadmin-divider"></div>

        {/* Related Species Section */}
        <div>
          <h2 className="relatedTitle">Related Species</h2>
          <div className="ceylonkraitadmin-related">
            {/* Input form */}
            <div className="ceylonkraitadmin-add-form">
              <textarea
                className="ceylonkraitadmin-textarea"
                placeholder="Enter details..."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
              />
              <div className="ceylonkraitadmin-file-input">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setNewImage(URL.createObjectURL(e.target.files[0]))
                  }
                />
                <button
                  className="ceylonkraitadmin-edit-button"
                  onClick={addRelatedSpecies}
                >
                  Add Species
                </button>
              </div>
            </div>
            <div className="ceylonkraitadmin-related-list">
              {relatedSpecies.map((sp) => (
                <div key={sp.id} className="ceylonkraitadmin-related-item">
                  <img src={sp.image} alt="Related Species" />
                  {sp.editMode ? (
                    <>
                      <textarea
                        className="ceylonkraitadmin-textarea"
                        value={sp.text}
                        onChange={(e) => updateText(sp.id, e.target.value)}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => updateImage(sp.id, e.target.files[0])}
                      />
                      <button
                        className="ceylonkraitadmin-edit-button"
                        onClick={() => toggleEdit(sp.id)}
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <p>{sp.text}</p>
                      <button
                        className="ceylonkraitadmin-edit-button"
                        onClick={() => toggleEdit(sp.id)}
                      >
                        Edit
                      </button>
                    </>
                  )}
                  {/* Delete Button */}
                  <button
                    className="ceylonkraitadmin-delete-button"
                    onClick={() => deleteSpecies(sp.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminCeylonkrait;
