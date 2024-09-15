"use client";
import {useEffect, useState} from 'react'
import {doc, getDoc, setDoc, updateDoc} from '@firebase/firestore';
import {db} from '@/firebase';
import {CharacterPhotoUrls} from "@/app/files/photos";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

// Mock data - replace with actual Smash Bros Ultimate characters and skills
const characters = [
  'Mario', 'Donkey Kong', 'Link', 'Samus & Dark Samus', 'Yoshi', 'Kirby', 'Fox', 'Pikachu', 'Luigi', 'Ness', 'Captain Falcon', 'Jigglypuff',
  'Peach & Daisy', 'Bowser', 'Ice Climbers', 'Sheik', 'Zelda', 'Dr Mario', 'Pichu', 'Falco', 'Marth', 'Lucina', 'Young Link', 'Ganondorf',
  'Mewtwo', 'Roy', 'Chrom', 'Mr Game & Watch', 'Meta Knight', 'Pit & Dark Pit', 'Zero Suit Samus', 'Wario', 'Snake', 'Ike', 'Pokemon Trainer',
  'Diddy Kong', 'Lucas', 'Sonic', 'King Dedede', 'Olimar', 'Lucario', 'ROB', 'Toon Link', 'Wolf', 'Villager', 'Mega Man', 'Wii Fit Trainer',
  'Rosalina & Luma', 'Little Mac', 'Greninja', 'Palutena', 'Pac-Man', 'Robin', 'Shulk', 'Bowser Jr', 'Duck Hunt', 'Ryu', 'Ken', 'Cloud', 'Corrin',
  'Bayonetta', 'Inkling', 'Ridley', 'Simon & Richter', 'King K Rool', 'Isabelle', 'Incineroar', 'Piranha Plant', 'Joker', 'Hero', 'Banjo & Kazooie',
  'Terry', 'Byleth', 'Min Min', 'Steve', 'Sephiroth', 'Pyra & Mythra', 'Kazuya', 'Sora', "Mii Brawler", "Mii Swordfighter", "Mii Gunner"
];
export const skills = ['Movement', "Edge Guarding", "Recovery", "Combos", "Defense"]


export default function Component() {
  const [char1, setChar1] = useState("loading...")
  const [char2, setChar2] = useState("loading...")
  const [currentSkill, setCurrentSkill] = useState(0)
  const [gameMemory, setGameMemory] = useState<Record<string, string>>({})


  useEffect(() => {
    console.log(db);
    updateRanking();

    setChar1(getRandomCharacter());
    setChar2(getRandomCharacter());
  }, []);

  useEffect(() => {
    if (char1 === char2) {
      setChar2(getRandomCharacter());
    }

  }, [char1]);

  function getRandomCharacter() {
    return characters[Math.floor(Math.random() * characters.length)]
  }

  async function updateRanking() {
    try {
      // Loop through all skills
      for (const skill of skills) {
        const skillRef = doc(db, "skills", skill);
        const skillDoc = await getDoc(skillRef);

        if (skillDoc.exists()) {
          const data = skillDoc.data();
          if (data) {
            const charactersWithRatios: { name: string, winrate: number }[] = [];

            // Collect win ratios for each character within the specific skill
            for (const character of characters) {
              const wins = data[`${character}Wins`] || 0;
              const losses = data[`${character}Losses`] || 0;
              const winrate = wins + losses > 0 ? wins / (wins + losses) : 0;

              charactersWithRatios.push({name: character, winrate});
            }

            // Sort the characters by win ratio (descending order)
            charactersWithRatios.sort((a, b) => b.winrate - a.winrate);

            // Prepare a ranking object to store the winner and loser within the skill context
            const rankings: Record<string, number> = {};
            charactersWithRatios.forEach((character, index) => {
              rankings[`${character.name}Rank`] = index + 1; // Ranking starts at 1
              rankings[`${character.name}Winrate`] = parseFloat(character.winrate.toFixed(5));
            });

            // Save the page.tsx under each skill with the "Rankings" sub-collection
            const rankingsDocRef = doc(db, "skills", skill, "Rankings", skill);
            await setDoc(rankingsDocRef, rankings);
          }
        }
      }
      console.log("Rankings updated successfully!");
    } catch (error) {
      console.error("Error updating page.tsx: ", error);
    }
  }

  // add a keyboard event listener for the spacebar, to skip the current game
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        newCharacters();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);


  async function addToFirestore(skill: string, winner: string, loser: string) {
    const skillDocRef = doc(db, "skills", skill);

    try {
      // Get the current document for the skill
      const skillDoc = await getDoc(skillDocRef);

      if (skillDoc.exists() && skillDoc.data()) {
        {
          // If the document exists, update wins and losses for the characters
          const currentData = skillDoc.data();

          if (currentData) {
            const winnerAttributeName = `${winner}Wins`;
            const winnerAttributeNameLosses = `${winner}Losses`;
            const loserAttributeName = `${loser}Losses`;
            const loserAttributeNameWins = `${loser}Wins`;
            const winnerWins = currentData[winnerAttributeName] || 0;
            const loserLosses = currentData[loserAttributeName] || 0;

            // for winrate (as double)
            const winnerLosses = currentData[winnerAttributeNameLosses] || 0;
            const loserWins = currentData[loserAttributeNameWins] || 0;

            const winnerWinrate = (winnerWins + 1) / (winnerWins + winnerLosses + 1);
            const loserWinrate = loserWins / (loserWins + loserLosses + 1);


            await updateDoc(skillDocRef, {
              [winnerAttributeName]: winnerWins + 1,
              [loserAttributeName]: loserLosses + 1,
              [`${winner}Winrate`]: parseFloat(winnerWinrate.toFixed(5)),
              [`${loser}Winrate`]: parseFloat(loserWinrate.toFixed(5)),
            } as never);
          }
        }
      } else {
        // If the document doesn't exist, create it with initial win/loss values
        await setDoc(skillDocRef, {
          [`${winner}Wins`]: 1,
          [`${loser}Losses`]: 1,
          [`${winner}Winrate`]: 1.0,
          [`${loser}Winrate`]: 0.0,
        });
      }
    } catch (error) {
      console.error("Error updating Firestore: ", error);
    }
  }


  async function handleChoice(choice: string) {
    // In a real game, you'd compare the actual character stats here
    console.log(`You chose ${choice} for ${skills[currentSkill]}`)
    // save the game memory, include the winner, loser, and the skill for each choice
    setGameMemory((prev) => ({...prev, [skills[currentSkill]]: choice}))
    setCurrentSkill((skill) => skill + 1)
    await addToFirestore(
      skills[currentSkill],
      choice === char1 ? char1 : char2,
      choice === char1 ? char2 : char1
    );

  }

  function newCharacters() {
    setChar1(getRandomCharacter())
    setChar2(getRandomCharacter())
    setCurrentSkill(0)

  }


  function Results(): JSX.Element {
    const [rankingData, setRankingData] = useState<{ skill: string, data: Record<string, number> }[]>([]);

    useEffect(() => {
      const fetchRankingData = async () => {
        const skillCollectionRefs = skills.map(skill => doc(db, "skills", skill, "Rankings", skill));

        // Use Promise.all to wait for all getDoc calls
        const rankingDataPromises = skillCollectionRefs.map(async (skillRef) => {
          const skillDoc = await getDoc(skillRef);
          if (skillDoc.exists() && skillDoc.data()) {
            const data = skillDoc.data();
            return {skill: skillRef.id, data};
          }
          return null; // Handle the case where the document does not exist
        });
        const rankingData = await Promise.all(rankingDataPromises);
        // Filter out any null values (in case a document didn't exist)
        const validRankingData = rankingData.filter(data => data !== null);
        setRankingData(validRankingData);

      };

      fetchRankingData();
    }, [currentSkill]);
    return (
      <div
        className="flex flex-col items-center justify-center bg-white min-h-[600px] rounded-lg shadow-xl w-full sm:max-w-[90%] md:max-w-[60%] p-6">
        <div className={"flex flex-row justify-between w-[100%] items-center"}>
          <img
            src={CharacterPhotoUrls[char1] as keyof typeof CharacterPhotoUrls}
            alt="avatar"
            className="self-left h-32"/>

          <img
            src={CharacterPhotoUrls[char2] as keyof typeof CharacterPhotoUrls}
            alt="avatar"
            className="self-right h-32"/>
        </div>
        {Object.entries(gameMemory).map(([skill, winner]) => {
          const winnerRank = rankingData.find((data) => data.skill === skill)?.data[`${winner}Rank`] ?? 0;
          const loserRank = rankingData.find((data) => data.skill === skill)?.data[`${winner === char1 ? char2 : char1}Rank`] ?? 0;
          const char1Rank = (winner === char1 ? winnerRank : loserRank);
          const char2Rank = (winner === char2 ? winnerRank : loserRank);
          const guessedSame = winnerRank < loserRank;
          const bgColor = guessedSame ? 'bg-green-50' : '';
          const char2Color = winner === char2 ? 'text-blue-500' : 'text-black';
          const char1Color = winner === char1 ? 'text-blue-500' : 'text-black';


          return (
            <div key={skill} className={"w-[100%] font-mono flex flex-col items-center"}>
              <div key={skill}
                   className="w-[100%] text-xl text-zinc-950 flex items-center flex-col  font-semibold text-center mb-6">


                <div
                  className={`${bgColor} rounded-md px-2 py-6 items-center flex w-[100%] justify-between`}>
                  <div>

                    <text className={`font-bold ${char1Color}`}>
                      #{char1Rank}
                    </text>
                  </div>
                  <div className={"flex flex-col items-center"}>
                    <text className="text-2xl text-black">{skill}</text>
                    {guessedSame ? (
                      <text className="text-sm text-black">(with crowd)</text>
                    ) : (
                      <text className="text-sm text-black">(without crowd)</text>
                    )}
                  </div>

                  <div>
                    <text className={`font-bold ${char2Color}`}>
                      #{char2Rank}
                    </text>
                  </div>
                </div>

              </div>
            </div>
          )
        })}
        <div className="flex justify-center">
          <button
            className="px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 transition-colors"
            onClick={newCharacters}
          >
            Play again (space)
          </button>
        </div>


      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4">

      <Navbar/>
      <div className={"flex-col flex items-center justify-center "}>

        {currentSkill < skills.length ? (

          <div className={"w-[60%]"}
          >

            <div className={"flex-col  pt-10 pb-10 items-center justify-center"}>

              <div className="w-[80%] sm:w-[100%]">

                <div className="text-xl text-zinc-950 flex items-center flex-col font-semibold text-center mb-6">
                  <text className={'text-xl font-mono text-black font-light '}>
                    who&apos;s better at...
                  </text>
                  <text className="text-5xl font-mono text-blue-600">{skills[currentSkill]}</text>
                </div>

                <div className="w-[100%] pt-10 flex justify-between items-center mb-8">
                  <div className={"flex"}>
                    <button
                      className={`min-w-60 text-lg text-blue-950 font-bold border-gray-300 rounded-lg hover:bg-gray-300 transition-colors`}
                      onClick={() => handleChoice(char1)}
                    >
                      <div className={'flex font-mono flex-col items-center'}>
                        {char1 !== "loading..." && (
                          <img
                            src={CharacterPhotoUrls[char1]}
                            alt="avatar"
                            className="h-64"
                          />
                        )}
                        {char1}
                      </div>
                    </button>
                  </div>
                  <div className={"flex"}>

                    <button
                      className={`w-60  text-lg text-blue-950 font-bold border-gray-300 rounded-lg hover:bg-gray-300 transition-colors`}
                      onClick={() => handleChoice(char2)}
                    >
                      <div className={'flex font-mono flex-col items-center'}>
                        {char2 !== "loading..." && (
                          <img
                            src={CharacterPhotoUrls[char2]}
                            alt="avatar"
                            className="h-64"
                          />
                        )}
                        {char2}
                      </div>
                    </button>

                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-20">
                <button
                  className="px-12 py-1 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 transition-colors"
                  onClick={newCharacters}
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Results/>
        )}
      </div>
      <Footer/>
    </div>
  )
}