import { atom } from "recoil";

export type Note = {
  id: string;
  name: string;
};

export const noteState = atom<Note | null>({
  key: "noteState",
  default: null,
});
