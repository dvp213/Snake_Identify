import React, { useState } from "react";
import "./App.css";
import ceylonKraitImg from "./assets/ceylonkrait.png";
import { useNavigate } from "react-router-dom";

function Details() {
  const navigate = useNavigate();

  // Default language is Sinhala
  const [language, setLanguage] = useState("si");

  return (
    <div className="details-wrapper">
      <div className="details-left">
        <div className="title-row">
          <h1 className="details-title">
            {language === "en" ? "Ceylon krait" : "මුදු කරවලා"}
            <span className="details-subtitle">
              {language === "en"
                ? " (Bungarus ceylonicus)"
                : " (Bungarus ceylonicus)"}
            </span>
          </h1>

          {/* Language Dropdown */}
          <select
            className="lang-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="si">සිංහල</option>
          </select>
        </div>

        <p className="details-text">
          {language === "en"
            ? "The Sri Lankan krait is small and slender. On hatching, the length of the snake is about 250 mm (9.8 in). The average adult length for this species is 75 cm (29+½ in) with 90 cm (35+½ in) being the upper limit. Its black skin is crossed with thin white transverse bands. It has an extraordinarily long lung which it inflates when angry."
            : "මුදු කරවලා කුඩා හා සිහින් ය. පැටවුන් බිහි වූ විට, සර්පයාගේ දිග 250 mm (අඟල් 9.8) පමණ වේ. මෙම විශේෂයේ සාමාන්‍ය වැඩිහිටි දිග සෙන්ටිමීටර 75 (අඟල් 29+½) වන අතර ඉහළ සීමාව සෙන්ටිමීටර 90 (අඟල් 35+½) වේ.මොහුගේ කළු පැහැති සමෙහි සුදු පැහැති පටි ලෙස දැකගත හැක. මොහුට අසාමාන්‍ය ලෙස දිගු පෙනහළු ඇති අතර එය කෝපයට පත් වූ විට එය පිම්බේ."}
        </p>

        <p className="details-text">
          {language === "en"
            ? "The highly potent venom of this snake attacks the central nervous system and gradually destroys it. Death is caused when the respiratory system is suppressed. Therefore, a bite from this snake should be treated immediately, or else the victim may die within 12 hours."
            : "මෙම සර්පයාගේ ඉතා ප්‍රබල විෂ මධ්‍යම ස්නායු පද්ධතියට පහර දෙන අතර ක්‍රමයෙන් එය විනාශ කරයි. ශ්වසන පද්ධතිය මර්දනය කළ විට මරණය සිදු වේ. එබැවින්, මෙම සර්පයා දෂ්ට කළ විට වහාම ප්‍රතිකාර කළ යුතුය, එසේ නොමැතිනම් වින්දිතයා පැය 12 ක් ඇතුළත මිය යා හැකිය."}
        </p>

        {/* Buttons remain always in English */}
        <div className="button-group">
          <button className="back-button" onClick={() => navigate("/")}>
            Go back
          </button>

          <button
            className="action-button"
            onClick={() => navigate("/related")}
          >
            Related Species
          </button>

          <button className="action-button" onClick={() => navigate("/Chatbot")}>
            Chat
          </button>
        </div>
      </div>

      <div className="details-right">
        <img
          src={ceylonKraitImg}
          alt="Ceylon krait combined"
          className="combined-image"
        />
      </div>
    </div>
  );
}

export default Details;
