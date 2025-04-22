import { customAlphabet } from "nanoid";

// 4M IDs needed, in order to have a 1% probability of at least one collision.
// this id setup is the simplest way to be compatible with the agora uid setup

const alphabet = "0123456789";
const nanoid = customAlphabet(alphabet, 15);

export const generateUserId = () => {
  const id = nanoid();
  return parseInt(id);
};
