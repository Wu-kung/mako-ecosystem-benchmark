import { stat } from "fs/promises";

export async function dirExist(p) {
  try {
    if ((await stat(p)).isDirectory()) return true;
  } catch {
    return false;
  }
}
