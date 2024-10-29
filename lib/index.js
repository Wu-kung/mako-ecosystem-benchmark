import { stat } from "fs/promises";

export async function dirExist(p) {
  try {
    if ((await stat(p)).isDirectory()) return true;
  } catch {
    return false;
  }
}

export async function useAddons(addons, stage, ...args) {
	for (const item of addons) {
		await item[stage](...args);
	}
}
