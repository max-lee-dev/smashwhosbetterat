import {DocumentData} from "@firebase/firestore";
import {useEffect, useState} from "react";

function MatchupModal({isOpen, character, skill, matchupWinrates, onClose}: {
  isOpen: boolean,
  character: string | null,
  skill: string | null,
  matchupWinrates: DocumentData | null,
  onClose: () => void
}) {
  const [filteredMatchupData, setFilteredMatchupData] = useState<DocumentData | null>(null);

  useEffect(() => {
    console.log(isOpen, character, matchupWinrates);
    if (isOpen && character && matchupWinrates) {

      // Filter matchups where the selected character is involved
      const filteredData = Object.entries(matchupWinrates)
        .filter(([key]) => key.includes(character))
        .filter(([key]) => key.includes("Winrate"))
        .reduce((acc, [key, value]) => ({...acc, [key]: value}), {});

      setFilteredMatchupData(filteredData);
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
        <h2 className="text-xl font-bold mb-4">{character} {skill} Matchups</h2>
        <div>
          {Object.entries(filteredMatchupData).length > 0 ? (
            <ul>
              {Object.entries(filteredMatchupData).map(([key, value]) => {
                  const cleaned = key.split("vs ")[1].trim();
                  // idk
                  return (
                    <li key={key} className="mb-2">
                      {opponent}: {value}
                    </li>
                  )
                }
              )}
            </ul>
          ) : (
            <p>No matchup data available for {character}.</p>
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