export const profileCharacters = {
  blue: "/assets/buddy.svg",
  red: "/assets/desktop-crown.svg",
  pink: "/assets/profile/pink.svg",
  purple: "/assets/profile/purple.svg",
} as const;
export type ProfileCharacter = keyof typeof profileCharacters;
// Assigned once when the profile is created/loaded; account edits do not reroll it.
export function assignProfileCharacter(sex: string, identity: string): ProfileCharacter {
  const options: readonly ProfileCharacter[] = sex === "Feminino"
    ? ["pink", "purple"]
    : sex === "Masculino" ? ["blue", "red"] : ["blue", "red", "pink", "purple"];
  let hash = 0;
  for (const char of identity.trim().toLowerCase()) hash = (Math.imul(hash, 31) + char.charCodeAt(0)) >>> 0;
  return options[hash % options.length];
}
