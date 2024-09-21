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
    console.log(isOpen, character, matchupWinrates);
    if (isOpen && character && matchupWinrates) {

      // Filter matchups where the selected character is involved


      // sort alphabetically
      let filteredData: MatchupData = {};  // Make sure filteredData is typed
      filteredData = Object.entries(matchupWinrates)
        .filter(([key]) => key.includes(character))
        .filter(([key]) => key.includes("Winrate"))
        .reduce((acc, [key, value]) => ({...acc, [key]: value}), {});

      // sort alphabetically
      const sortedData = Object.keys(filteredData).sort();
      const sortedFilteredData = Object.fromEntries(
        sortedData.map((key) => [key, filteredData[key]])
      );

      setFilteredMatchupData(sortedFilteredData);

      setFilteredMatchupData(sortedFilteredData);
    }
  }, [isOpen, character, matchupWinrates]);

  if (!isOpen || !character || !skill || !filteredMatchupData) return null;

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <div onClick={handleOverlayClick}
         className="fixed inset-0 text-black bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 shadow-lg w-[90%] max-w-md">
        <div className={"flex items-end"}>
          <img src={CharacterPhotoUrls[character]} alt="avatar" className="h-24"/>
          <h2 className="text-xl font-bold mb-4">{character} {skill} Data</h2>
        </div>
        <div>
          {Object.entries(filteredMatchupData).length > 0 ? (
            <ul>
              {Object.entries(filteredMatchupData).map(([key, value], index) => {
                const opponent = key.replace("vs", "").replace(character, "").replace("Winrate", "").split("-")[0].trim();
                const formattedKey = key.split("-")[1];
                const hasOpponent = formattedKey.includes(opponent);
                const hasEven = formattedKey.includes("Even");
                const hasCharacter = formattedKey.includes(character);

                const losing = value < 0.5;
                const badgeColor = losing && formattedKey.includes(character) ? "bg-red-200" :
                  hasEven ? "bg-gray-200" : "bg-green-200";

                let hasImage = false;
                if (index % 3 === 0) {
                  hasImage = true;
                }

                return (
                  <div key={key}>
                    {hasImage && (
                      <div className={"my-4"}>
                        <hr/>
                      </div>
                    )}
                    <div className={"flex flex-row"}>
                      {hasCharacter && (
                        <img src={CharacterPhotoUrls[opponent]} alt="avatar" className="w-16"/>
                      )}
                      {hasCharacter && (

                        <li
                          className={`${badgeColor} flex flex-row text-bold rounded-md font-mono ml-2 p-4 pr-6 mb-2`}
                          style={{width: `${value * 100}%`}}
                        >

                          {(value * 100)}%
                        </li>
                      )}

                      {hasOpponent && (
                        <text className={"pl-2 font-mono"}>
                          {opponent}
                        </text>
                      )}
                    </div>
                  </div>
                );
              })}
            </ul>
          ) : (
            <p>No {skill} data available for {character}.</p>
          )}
        </div>
        <button
          className="mt-4 bg-red-500 text-white py-2 px-4 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default MatchupModal;