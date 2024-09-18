"use client";
import {useEffect, useState} from "react";
import {characters, skills} from "@/app/components/Game";
import {doc, getDoc, setDoc} from "@firebase/firestore";
import {db} from "@/firebase";
import {CharacterPhotoUrls} from "@/app/files/photos";
import {useRouter} from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function Ranking() {
  const [skill, setSkill] = useState(0);
  const [data, setData] = useState<{ skill: string, data: Record<string, { rank: number, winrate: number }> }[]>();
  const [sortedRanking, setSortedRanking] = useState<{ name: string, rank: number, winrate: number }[]>();
  const router = useRouter();

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

  useEffect(() => {
    updateRanking();
  }, []);

  useEffect(() => {
    const fetchRankingData = async () => {
      const skillCollectionRefs = skills.map(skill => doc(db, "skills", skill, "Rankings", skill));

      const rankingDataPromises = skillCollectionRefs.map(async (skillRef) => {
        const skillDoc = await getDoc(skillRef);
        if (skillDoc.exists() && skillDoc.data()) {
          const data = skillDoc.data();
          if (!data) return;
          const rankingData: Record<string, { rank: number, winrate: number }> = {};

          for (const key in data) {
            if (key.includes("Rank")) {
              const characterName = key.replace("Rank", "");
              rankingData[characterName] = {
                rank: data[key],
                winrate: data[`${characterName}Winrate`] || 0,
              };
            }
          }

          return {skill: skillRef.id, data: rankingData};
        }
        return null;
      });

      const rankingData = await Promise.all(rankingDataPromises);
      const validRankingData = rankingData.filter(data => data !== null) as {
        skill: string,
        data: Record<string, { rank: number, winrate: number }>
      }[];
      setData(validRankingData);

      const thisData = validRankingData[0]?.data;
      if (thisData) {
        // Convert the ranking data to a sorted array of objects
        const sortedRanking = Object.keys(thisData)
          .map((characterName) => ({
            name: characterName,
            rank: thisData[characterName].rank,
            winrate: thisData[characterName].winrate,
          }))
          .sort((a, b) => a.rank - b.rank); // Sort by rank

        setSortedRanking(sortedRanking);
      }

      chooseSkill(0);  // Choose the first skill on load
    };

    fetchRankingData();
  }, [db]);

  function chooseSkill(index: number) {
    setSkill(index);
    const thisData = data?.find(d => d.skill === skills[index])?.data;

    if (thisData) {
      // Convert the ranking data to a sorted array of objects
      const sortedRanking = Object.keys(thisData)
        .map((characterName) => ({
          name: characterName,
          rank: thisData[characterName].rank,
          winrate: thisData[characterName].winrate,
        }))
        .sort((a, b) => a.rank - b.rank); // Sort by rank

      setSortedRanking(sortedRanking);
    }
  }

  function character(name: string, image: string, rank: number, winrate: number) {

    const realName = name.replace("Rank", "");
    const characterImage = CharacterPhotoUrls[realName];
    if (!name.includes("Winrate"))
      return (
        <div className="font-mono flex items-center justify-between">
          <div className=" w-[50%] flex items-center">
            <div className={"w-[15%]"}>
              <img
                src={characterImage}
                alt="avatar"
                className="h-16"
              />
            </div>
            <div className="ml-2">
              <p className="font-bold text-black">{name.replaceAll("Rank", "")}</p>
              <p className="text-sm text-gray-600">{(winrate * 100).toFixed(2)}%</p>
            </div>
          </div>
          <div>
            <p className="text-md font-bold text-gray-600">#{rank}</p>
          </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-white flex items-center flex-col justify-center p-4">
      <Navbar/>
      <div className="bg-white shadow-lg rounded-lg p-4 w-[70%]">

        <div className={"bg-white border w-full rounded-md p-4 flex sticky top-2"}>


          {skills.map((s, index) => (
            <button
              key={index}
              onClick={() => chooseSkill(index)}
              className={`w-[80%] text-center text-black font-bold p-2 rounded-lg ${
                index === skill ? "bg-blue-100" : ""
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {sortedRanking?.map((entry, index) => (
          <div key={index} className="mt-4">
            {character(entry.name, "", entry.rank, entry.winrate)}
          </div>
        ))}
      </div>
      <button
        onClick={() => router.push("/rankings")}
        className="fixed bottom-4 font-bold right-4 bg-blue-500 text-white w-16 h-10 p-2 rounded-full"
      >
        ^
      </button>
      <Footer/>
    </div>
  );
}