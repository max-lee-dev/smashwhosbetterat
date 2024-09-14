"use client";
import {useEffect, useState} from 'react'

// Mock data - replace with actual Smash Bros Ultimate characters and skills
const characters = [
  'Mario', 'Donkey Kong', 'Link', 'Samus / Dark Samus', 'Yoshi', 'Kirby', 'Fox', 'Pikachu', 'Luigi', 'Ness', 'Captain Falcon', 'Jigglypuff',
  'Peach / Daisy', 'Bowser', 'Ice Climbers', 'Sheik', 'Zelda', 'Dr. Mario', 'Pichu', 'Falco', 'Marth', 'Lucina', 'Young Link', 'Ganondorf',
  'Mewtwo', 'Roy', 'Chrom', 'Mr. Game & Watch', 'Meta Knight', 'Pit / Dark Pit', 'Zero Suit Samus', 'Wario', 'Snake', 'Ike', 'Pokemon Trainer',
  'Diddy Kong', 'Lucas', 'Sonic', 'King Dedede', 'Olimar', 'Lucario', 'R.O.B.', 'Toon Link', 'Wolf', 'Villager', 'Mega Man', 'Wii Fit Trainer',
  'Rosalina & Luma', 'Little Mac', 'Greninja', 'Palutena', 'Pac-Man', 'Robin', 'Shulk', 'Bowser Jr.', 'Duck Hunt', 'Ryu', 'Ken', 'Cloud', 'Corrin',
  'Bayonetta', 'Inkling', 'Ridley', 'Simon / Richter', 'King K. Rool', 'Isabelle', 'Incineroar', 'Piranha Plant', 'Joker', 'Hero', 'Banjo & Kazooie',
  'Terry', 'Byleth', 'Min Min', 'Steve', 'Sephiroth', 'Pyra / Mythra', 'Kazuya', 'Sora'
];
const skills = ['Movement', "Edge Guarding", "Recovery", "Combos", "Defense"]

export default function Component() {
  const [char1, setChar1] = useState("loading...")
  const [char2, setChar2] = useState("loading...")
  const [currentSkill, setCurrentSkill] = useState(0)
  const [timer, setTimer] = useState(5)
  const [canSelect, setCanSelect] = useState(false)


  useEffect(() => {
    setChar1(getRandomCharacter());
    setChar2(getRandomCharacter());
  }, []);

  function getRandomCharacter() {
    return characters[Math.floor(Math.random() * characters.length)]
  }

  function handleChoice(choice: string) {
    // In a real game, you'd compare the actual character stats here
    if (!canSelect) return;
    if (currentSkill === skills.length - 1) {
      nextQuestion()
    } else {
      setCurrentSkill((skill) => skill + 1)
    }
    setCanSelect(false)
    setTimer(5);
  }

  function nextQuestion() {
    setChar1(getRandomCharacter())
    setChar2(getRandomCharacter())
    setCurrentSkill(0)
  }
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 1) {
          setCanSelect(true)
          return 0
        }
        return prevTimer - 1
      })
    }, 1000)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 flex items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center  bg-white min-h-[600px] rounded-lg shadow-xl w-full max-w-[60%] p-6">
        <div className="w-[80%]">
        <h1 className="text-2xl text-zinc-950 font-bold text-center mb-6">Smash Bros Ultimate Comparison</h1>
        <div className="text-xl text-zinc-950 font-semibold text-center mb-6">
          Who&apos;s better at: <span className="text-blue-600">{skills[currentSkill]}</span>?
        </div>
        <div className="w-[100%]  flex justify-between items-center mb-8">
          <button
            className="w-40 h-40 text-lg text-blue-950 font-bold border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => handleChoice(1)}
          >
            {char1}
          </button>
          <div className="text-2xl text-blue-950 font-bold">VS</div>
          <button
            className="w-40 h-40 text-lg text-blue-950 font-bold border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => handleChoice(2)}
          >
            {char2}
          </button>
        </div>
        </div>
        <div className="min-h-10 text-4xl text-blue-950 font-bold text-center mb-6">
          {timer > 0 && timer}
        </div>

        <div className="flex justify-center">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            onClick={nextQuestion}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}