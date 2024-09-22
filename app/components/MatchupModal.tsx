import {DocumentData} from "@firebase/firestore";
import {useEffect, useState} from "react";
import {CharacterPhotoUrls} from "@/app/files/photos";

function MatchupModal({isOpen, character, skill, matchupWinrates, onClose}: {
  isOpen: boolean,
  character: string | null,
  skill: string | null,
  matchupWinrates: DocumentData | null,
  onClose: () => void
}) {
  type MatchupData = {
    [key: string]: {
      wins: number;
      losses: number;
      // add any other fields your data structure has
    };
  };
  const [filteredMatchupData, setFilteredMatchupData] = useState<DocumentData | null>(null);
  useEffect(() => {
    function handleEscapePress(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscapePress);
    return () => window.removeEventListener("keydown", handleEscapePress);
  }, []);

  useEffect(() => {
    console.log(isOpen, character, matchupWinrates);
    if (isOpen && character && matchupWinrates) {

      // Filter matchups where the selected character is involved


      // sort alphabetically
      let filteredData: MatchupData = {};  // Make sure filteredData is typed
      filteredData = Object.entries(matchupWinrates)
        .filter(([key]) => key.includes(character))
        .filter(([key]) => key.includes("Winrate"))// filter by winrate

        .reduce((acc, [key, value]) => ({...acc, [key]: value}), {});

      //sort by winrate
      filteredData = Object.entries(filteredData)
        .sort((a, b) => b[1] - a[1])
        .reduce((acc, [key, value]) => ({...acc, [key]: value}), {});


      // sort alphabetically


      setFilteredMatchupData(filteredData);
    }
  }, [isOpen, character, matchupWinrates]);

  if (!isOpen || !character || !skill || !filteredMatchupData) return null;

  // event listener for when escape is pressed, close modal


  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <div onClick={handleOverlayClick}
         className="fixed inset-0 text-black bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 shadow-lg w-[100%] sm:w-[70%] h-[90%]">
        <div className={"flex items-end"}>
          <img src={CharacterPhotoUrls[character]} alt="avatar" className="h-16 sm:h-24"/>
          <h2 className="px-6 p-4 font-mono text-md sm:text-5xl font-bold mb-4">{character} {skill} Data</h2>
        </div>
        <div className={"overflow-y-scroll h-[75%] sm:h-[72%]"}>
          {Object.entries(filteredMatchupData).length > 0 ? (
            <ul>
              {Object.entries(filteredMatchupData).map(([key, value], idx) => {
                const opponent = key.replace("vs", "").replace(character, "").replace("Winrate", "").split("-")[0].trim();
                const formattedKey = key.split("-")[1];
                const hasEven = formattedKey.includes("Even");
                const hasCharacter = formattedKey.includes(character);

                const losing = value < 0.5;
                const badgeColor = losing && formattedKey.includes(character) ? "bg-red-200" :
                  hasEven ? "bg-gray-200" : "bg-green-200";


                if (hasCharacter)
                  return (
                    <div className={"flex flex-row"} key={idx}>
                      <div className={"min-w-16"}>
                        <img src={CharacterPhotoUrls[opponent]} alt="avatar" className="h-16"/>
                      </div>

                      <li
                        className={`${badgeColor} flex flex-row text-bold text-sm sm:text-md rounded-md font-mono ml-2 p-4 pr-6 mb-2`}
                        style={{width: `${value * 100}%`}}
                      >

                        {value > 0.3 && `vs ${opponent} - ${(value * 100)}%`}


                      </li>
                      {value < 0.3 &&
                        <p
                          className={"text-black font-mono text-sm sm:text-md self-center px-8"}>vs {opponent} - {(value * 100).toFixed(2)}%</p>}
                    </div>
                  );
              })}

            </ul>
          ) : (
            <p>No {skill} data available for {character}.</p>
          )}
        </div>
        <div className={"w-[100%] py-6 flex justify-end"}>
          <button
            className="mt-4 bg-red-500 text-white py-2 px-4 rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default MatchupModal;