import {doc, DocumentData, getDoc} from "@firebase/firestore";
import {db} from "@/firebase";

export function getVSString(char1: string, char2: string) {
  // determine whos first by alphabetical
  if (char1 < char2) {
    return `${char1} vs ${char2}`;
  } else {
    return `${char2} vs ${char1}`;
  }
}

export async function getWinrateDocument(skill: string) {
  const rankingsDocRef = doc(db, "skills", skill, "Matchups", "Winrates");
  const rankingsDoc = await getDoc(rankingsDocRef);
  if (rankingsDoc.exists() && rankingsDoc.data()) {
    return rankingsDoc.data();
  }
}

export function findWinrate(winrates: DocumentData, desiredCharacter: string, otherCharacter: string) {
  const vsString = getVSString(desiredCharacter, otherCharacter);
  const string = vsString + `-${desiredCharacter}Winrate`

  if (winrates[string]) {
    return winrates[string];
  } else {
    return 1.0;
  }
}