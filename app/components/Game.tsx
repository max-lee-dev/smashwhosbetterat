"use client";
import {useEffect, useState} from 'react'
import {doc, DocumentData, getDoc, setDoc, updateDoc} from '@firebase/firestore';
import {db} from '@/firebase';
import {CharacterPhotoUrls} from "@/app/files/photos";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import {findWinrate, getVSString, getWinrateDocument} from "@/app/utils/utils";
import {Center, Collapse} from "@chakra-ui/react";

// Mock data - replace with actual Smash Bros Ultimate characters and skills
export const characters = [
  'Mario', 'Donkey Kong', 'Link', 'Samus & Dark Samus', 'Yoshi', 'Kirby', 'Fox', 'Pikachu', 'Luigi', 'Ness', 'Captain Falcon', 'Jigglypuff',
  'Peach & Daisy', 'Bowser', 'Ice Climbers', 'Sheik', 'Zelda', 'Dr Mario', 'Pichu', 'Falco', 'Marth', 'Lucina', 'Young Link', 'Ganondorf',
  'Mewtwo', 'Roy', 'Chrom', 'Mr Game & Watch', 'Meta Knight', 'Pit & Dark Pit', 'Zero Suit Samus', 'Wario', 'Snake', 'Ike', 'Pokemon Trainer',
  'Diddy Kong', 'Lucas', 'Sonic', 'King Dedede', 'Olimar', 'Lucario', 'ROB', 'Toon Link', 'Wolf', 'Villager', 'Mega Man', 'Wii Fit Trainer',
  'Rosalina & Luma', 'Little Mac', 'Greninja', 'Palutena', 'Pac-Man', 'Robin', 'Shulk', 'Bowser Jr', 'Duck Hunt', 'Ryu', 'Ken', 'Cloud', 'Corrin',
  'Bayonetta', 'Inkling', 'Ridley', 'Simon & Richter', 'King K Rool', 'Isabelle', 'Incineroar', 'Piranha Plant', 'Joker', 'Hero', 'Banjo & Kazooie',
  'Terry', 'Byleth', 'Min Min', 'Steve', 'Sephiroth', 'Pyra & Mythra', 'Kazuya', 'Sora', "Mii Brawler", "Mii Swordfighter", "Mii Gunner"
];
export const skills = ['Movement', "Edge Guarding", "Recovery", "Combos", "Defense", "Matchup"]


export default function Component() {
  const [char1, setChar1] = useState("loading...")
  const [char2, setChar2] = useState("loading...")
  const [numGames, setNumGames] = useState(0)
  const [currentSkill, setCurrentSkill] = useState(0)
  const [gameMemory, setGameMemory] = useState<Record<string, string>>({})
  const [movementWinrates, setMovementWinrates] = useState<DocumentData | null>(null);
  const [EdgeGuardingWinrates, setEdgeGuardingWinrates] = useState<DocumentData | null>(null);
  const [RecoveryWinrates, setRecoveryWinrates] = useState<DocumentData | null>(null);
  const [CombosWinrates, setCombosWinrates] = useState<DocumentData | null>(null);
  const [DefenseWinrates, setDefenseWinrates] = useState<DocumentData | null>(null);
  const [MatchupWinrates, setMatchupWinrates] = useState<DocumentData | null>(null);


  useEffect(() => {
    getWinrateDocument("Movement").then((data) => {
      if (!data) return;
      setMovementWinrates(data);
    })
    getWinrateDocument("Edge Guarding").then((data) => {
      if (!data) return;
      setEdgeGuardingWinrates(data);
    })
    getWinrateDocument("Recovery").then((data) => {
      if (!data) return;
      setRecoveryWinrates(data);
    })
    getWinrateDocument("Combos").then((data) => {
      if (!data) return;
      setCombosWinrates(data);
    })
    getWinrateDocument("Defense").then((data) => {
      if (!data) return;
      setDefenseWinrates(data);
    })
    getWinrateDocument("Matchup").then((data) => {
      if (!data) return;
      setMatchupWinrates(data);
    })

    setChar1("Steve");
    setChar2(getRandomCharacter());
  }, []);

  useEffect(() => {
    if (char1 === char2) {
      setChar2("Shulk")
    }

  }, [char1]);

  function getRandomCharacter() {
    return characters[Math.floor(Math.random() * characters.length)]
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


  async function addToFirestore(skill: string, even: boolean, winner: string, loser: string) {
    if (!db) return;
    const skillDocRef = doc(db, "skills", skill);

    if (!even) { // if not even, then we update the win/losses for the characters
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

    // Match Up winrate
    const charactersString = getVSString(winner, loser);
    const rankingsDocRef = doc(db, "skills", skill, "Matchups", "Winrates");
    const rankingsDoc = await getDoc(rankingsDocRef);
    if (rankingsDoc.exists() && rankingsDoc.data()) {
      const currentData = rankingsDoc.data();
      // set doc so we just keep on adding more stuffies!.
      if (currentData) {
        const winnerWins = currentData[`${charactersString}-${winner}`] || 0;
        const loserWins = currentData[`${charactersString}-${loser}`] || 0;
        const totalGames = currentData[`${charactersString}-totalGames`] || 0;
        const evenGames = currentData[`${charactersString}-Even`] || 0;
        const winnerWinrate = totalGames === 0 ? 1.0 : parseFloat(String((winnerWins + 1) / (totalGames + 1))).toFixed(5);
        const loserWinrate = totalGames === 0 ? 0.0 : parseFloat(String((loserWins) / (totalGames + 1))).toFixed(5);
        if (!even) {
          await updateDoc(rankingsDocRef, {
            [`${charactersString}-${winner}`]: winnerWins + 1,
            [`${charactersString}-${loser}`]: loserWins,
            [`${charactersString}-totalGames`]: totalGames + 1,
            [`${charactersString}-Even`]: evenGames,
            [`${charactersString}-EvenWinrate`]: parseFloat(String(evenGames / (totalGames + 1))).toFixed(4),
            [`${charactersString}-${winner}Winrate`]: winnerWinrate,
            [`${charactersString}-${loser}Winrate`]: loserWinrate,
          } as never);
        } else {
          await updateDoc(rankingsDocRef, {
            [`${charactersString}-Even`]: evenGames + 1,
            [`${charactersString}-${winner}Winrate`]: parseFloat(String((winnerWins) / (totalGames + 1))).toFixed(5),
            [`${charactersString}-${loser}Winrate`]: parseFloat(String((loserWins) / (totalGames + 1))).toFixed(5),
            [`${charactersString}-EvenWinrate`]: totalGames === 0 ? 0.0 : parseFloat(String((evenGames + 1) / (totalGames + 1))).toFixed(4),
            [`${charactersString}-totalGames`]: totalGames + 1,
          } as never);
        }
      }
    } else {
      // If the document doesn't exist, create it with initial win/loss values
      await setDoc(rankingsDocRef, {
        [`${charactersString}-${winner}`]: 1,
        [`${charactersString}-${loser}`]: 0,
        [`${charactersString}-Even`]: 0,
        [`${charactersString}-EvenWinrate`]: 0,
        [`${charactersString}-totalGames`]: 1,
        [`${charactersString}-${winner}Winrate`]: 1.0,
        [`${charactersString}-${loser}Winrate`]: 0.0,
      });
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
      choice === "Even",
      choice === char1 ? char1 : char2,
      choice === char1 ? char2 : char1
    );

  }

  function newCharacters() {
    setNumGames((prevNumGames) => {
      const newNumGames = prevNumGames + 1;
      const curTotalGames = Number(localStorage.getItem("numGames")) || 0;
      localStorage.setItem("numGames", String(1 + curTotalGames));


      const thisDate = new Date();
      fetch("https://discord.com/api/webhooks/1284975432529346721/lbicsDRwzKbyg1Ge70bkYIsN_oYazPKSokc2T9lGiKCaCCWsHEsOFeIsIW5Y-Ze2MVtt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: `${thisDate}\nNew game started! This user has played ${curTotalGames} games this session.`,
        }),
      });
      return newNumGames;
    });
    console.log(`New game started! ${numGames} games played.`);
    setChar1(getRandomCharacter())
    setChar2(getRandomCharacter())
    setCurrentSkill(0)

  }


  function Results(): JSX.Element {

    return (

      <div
        className="mt-62flex flex-col items-center justify-center bg-white min-h-[600px] rounded- w-full sm:max-w-[90%] md:max-w-[80%] p-2">
        {currentSkill === skills.length && (

          <div className={"px-[6%]  flex flex-row justify-between w-[100%] items-center"}>
            <img
              src={CharacterPhotoUrls[char1] as keyof typeof CharacterPhotoUrls}
              alt="avatar"
              className="self-left w-16 md:w-28"/>

            <text className={"text-2xl md:text-5xl font-mono text-blue-500 font-bold"}>Results</text>

            <img
              src={CharacterPhotoUrls[char2] as keyof typeof CharacterPhotoUrls}
              alt="avatar"
              className="self-right w-16 md:w-28"/>
          </div>
        )}
        {Object.entries(gameMemory).map(([skill, winner]) => {
          let WinrateDocument = movementWinrates;
          if (skill === "Movement") {
            WinrateDocument = movementWinrates;
          } else if (skill === "Edge Guarding") {
            WinrateDocument = EdgeGuardingWinrates;
          } else if (skill === "Recovery") {
            WinrateDocument = RecoveryWinrates;
          } else if (skill === "Combos") {
            WinrateDocument = CombosWinrates;
          } else if (skill === "Defense") {
            WinrateDocument = DefenseWinrates;
          } else if (skill === "Matchup") {
            WinrateDocument = MatchupWinrates;
          }


          let char1Winrate: number = WinrateDocument ? findWinrate(
            WinrateDocument,
            char1,
            char2,
          ) * 100 : 0;
          // const notChosenCharacterWinrate = 100 - chosenCharacterWinrate;
          let char2Winrate: number = WinrateDocument ? findWinrate(
            WinrateDocument,
            char2,
            char1,
          ) * 100 : 0;
          const vsString = getVSString(char1, char2);
          const string = vsString + `-EvenWinrate`
          let evenWinrate = WinrateDocument ? (WinrateDocument[string] * 100) : 0;
          if (isNaN(evenWinrate)) {
            evenWinrate = 0;
          }

          if (char1Winrate === 100 && char2Winrate === 100) {
            // then we have no data on this matchup
            // give winner 100% winrate and loser 0% winrate
            if (winner === char1) {
              char1Winrate = 100;
              char2Winrate = 0;
            } else if (winner === char2) {
              char1Winrate = 0;
              char2Winrate = 100;
            } else {
              char1Winrate = 0;
              char2Winrate = 0;
              evenWinrate = 100;
            }
          }

          const evenWinrateString = parseFloat(String(evenWinrate)).toFixed(2);
          const char1WinrateString = parseFloat(String(char1Winrate)).toFixed(2);
          const char2WinrateString = parseFloat(String(char2Winrate)).toFixed(2);


          let char1Badge = char1Winrate >= 50 ? "bg-blue-500" : "bg-red-500";
          let char2Badge = char2Winrate >= 50 ? "bg-blue-500" : "bg-red-500";
          let evenBadge = evenWinrate >= 50 ? "bg-blue-500" : "bg-red-500";
          if (skill === "Matchup") {
            if (winner === char1) {
              char1Badge = char1Winrate >= 33 ? "bg-blue-500" : "bg-red-500";
              char2Badge = "bg-gray-500";
              evenBadge = "bg-gray-500";
            } else if (winner === char2) {
              char2Badge = char2Winrate >= 33 ? "bg-blue-500" : "bg-red-500";
              char1Badge = "bg-gray-500";
              evenBadge = "bg-gray-500";
            } else {
              evenBadge = evenWinrate >= 33 ? "bg-blue-500" : "bg-red-500";
              char1Badge = "bg-gray-500";
              char2Badge = "bg-gray-500";
            }
          }


          return (
            <div key={skill} className={"w-[100%]  min-h-[10%] font-mono flex flex-col items-center"}>

              <div key={skill}
                   className="w-[100%] h-[100%] text-xl text-zinc-950 flex items-center flex-col  font-semibold text-center ">


                <div
                  className={`rounded-md h-[100%] my-2 items-center flex flex-row w-[100%] justify-between`}>

                  <div
                    className={'w-[40%] rounded-2xl min-h-[40px] flex justify-between text-center items-center'}>
                    <text className={`font-bold text-center`}>
                      {/*{skill !== "Matchup" && `Rank #${char1Rank}`}*/}
                      {(winner === char1 || skill === "Matchup") && (
                        <div
                          className={`${char1Badge} w-[70%]  md:min-h-[50px] text-white text-sm font-bold me-2 px-2.5 py-0.5 rounded`}>
                          <span
                            className={``}>
                              {skill === "Matchup" ? `${char1WinrateString}% picked ${char1}` : `${char1WinrateString}% agreed`}
                          </span>
                        </div>
                      )}

                    </text>

                  </div>
                  <div className={"w-fit flex flex-col"}>
                    <text className="text-xl text-black">{skill}</text>
                    {skill === "Matchup" && (
                      <span
                        className={`${evenBadge} min-w-[50%] text-white text-sm font-bold me-2 px-2.5 py-0.5 rounded`}>
                              {evenWinrateString}% picked even
                            </span>
                    )}
                  </div>

                  <div
                    className={'w-[40%]  rounded-2xl min-h-[40px] flex flex-row'}>
                    {/*{skill !== "Matchup" && `Rank #${char1Rank}`}*/}
                    {(winner === char2 || skill === "Matchup") && (
                      <div
                        className={`${char2Badge} ml-auto font-bold text-center w-[70%] self-end justify-end md:w-[100%] md:min-h-[50px] text-white text-sm font-bold me-2 px-2.5 py-0.5 rounded`}>
                          <span
                            className={``}>
                              {skill === "Matchup" ? `${char2WinrateString}% picked ${char2}` : `${char2WinrateString}% agreed`}
                          </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <div className="mt-4 flex justify-center">
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
      <Center className={"flex flex-col items-center"}>
        <Collapse in={currentSkill < skills.length}
                  className={'justify-self-center flex-col flex items-center justify-center self-center w-[100%]'}>
          <Center>
            <div className={"w-[100%]  sm:w-[60%] self-center "}>

              <div className={"flex-col  pt-10 pb-10 items-center justify-center"}>

                <div className="w-[100%] sm:w-[100%]">

                  <div
                    className="text-xl h-32 text-zinc-950 flex items-center flex-col font-semibold text-center pb-6">
                    <text className={'text-xl font-mono text-black font-light'}>
                      {currentSkill !== skills.length - 1 ? "who's better at..." : "who wins the"}
                    </text>
                    <text className="text-5xl font-mono text-blue-600">{skills[currentSkill]}</text>

                  </div>

                  <div className="w-[100%] pt-10 flex justify-between items-center mb-8">
                    <div className={"flex min-w-[25%] md:min-w-[40%]"}>
                      <button
                        className={`self-start min-w-[35%] md:min-w-60 text-lg text-blue-950 font-bold border-gray-300 rounded-lg hover:bg-gray-300 transition-colors`}
                        onClick={() => handleChoice(char1)}
                      >
                        <div className={'flex font-mono flex-col items-center'}>
                          {char1 !== "loading..." && (
                            <img
                              src={CharacterPhotoUrls[char1]}
                              alt="avatar"
                              className="h-36 md:h-64 p-2"
                            />
                          )}
                          <text className={"text-sm md:text-md pb-2"}>
                            {char1}
                          </text>
                        </div>
                      </button>
                    </div>

                    <div>
                      {currentSkill === skills.length - 1 && (
                        <div className="hidden md:flex min-w-[25%] md:min-w-[60%] justify-center mt-2">
                          <button
                            className="px-2 md:px-8 py-2 md:py-4 border-2 border-blue-500 text-blue-600 font-mono text-sm md:text-md font-bold rounded hover:bg-gray-100 transition-colors"
                            onClick={() => handleChoice("Even")}
                          >
                            Even
                          </button>
                        </div>
                      )}
                    </div>
                    <div className={"flex justify-end  min-w-[25%] md:min-w-[40%]"}>

                      <button
                        className={`min-w-[35%] md:min-w-60 text-lg text-blue-950 font-bold border-gray-300 rounded-lg hover:bg-gray-300 transition-colors`}
                        onClick={() => handleChoice(char2)}
                      >
                        <div className={'flex font-mono flex-col items-center'}>
                          {char2 !== "loading..." && (
                            <img
                              src={CharacterPhotoUrls[char2]}
                              alt="avatar"
                              className="h-36 md:h-64  p-2"
                            />
                          )}
                          <text className={"text-sm md:text-md pb-2"}>
                            {char2}
                          </text>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  {currentSkill === skills.length - 1 && (
                    <div className="flex md:hidden min-w-[25%] md:min-w-[60%] justify-center mt-2">
                      <button
                        className="px-8 py-4 border-2 border-blue-500 text-blue-600 font-mono text-md font-bold rounded hover:bg-gray-100 transition-colors"
                        onClick={() => handleChoice("Even")}
                      >
                        Even
                      </button>
                    </div>
                  )}
                </div>


                <div className="flex justify-center mt-4">
                  <button
                    className="px-12 py-1 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 transition-colors"
                    onClick={newCharacters}
                  >
                    Skip
                  </button>
                </div>
              </div>
            </div>
          </Center>
        </Collapse>

        <Collapse className={"self-center w-[100%]"} in={currentSkill === skills.length}>
          <Center className={"w-[100%]"}>
            <Results/>
          </Center>
        </Collapse>
      </Center>
      <Footer/>
    </div>
  )
}