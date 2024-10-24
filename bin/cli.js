import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import meow from "meow";
import { $, cd } from "zx";
import actionsCore from "@actions/core";
import { dirExist } from "../lib/index.js";

$.verbose = true;

const cli = meow({
  importMeta: import.meta,
  flags: {
    repository: {
      type: "string",
      default: "umijs/mako",
    },
    ref: {
      type: "string",
      default: "master",
    },
    shard: {
      type: "string",
      default: "1/1",
    },
    base: {
      type: "string",
      default: "latest",
    },
    current: {
      type: "string",
      default: "current",
    },
  },
});

const command = cli.input.at(0);

const { repository, ref } = cli.flags;

const cwd = process.cwd();

const makoDirectory = join(cwd, ".mako");

if (!command || command === "build") {
  const fetchUrl = `https://github.com/${repository}`;
  if (!(await dirExist(makoDirectory))) {
    await $`git clone ${fetchUrl} ${makoDirectory}`;
  }
  cd(makoDirectory);

  await $`git reset --hard`;
  const currentBranch = (await $`git rev-parse --abbrev-ref HEAD`).toString().trim();
  await $`git fetch ${fetchUrl} ${ref} --prune`;
  await $`git checkout -b ${Date.now()} FETCH_HEAD`;
  if (currentBranch) {
    await $`git branch -D ${currentBranch}`;
  }

  await $`git log -1`;

  await $`pnpm --version`;
  await $`pnpm install --prefer-frozen-lockfile --prefer-offline`;

  cd(cwd);
}

if (!command || command === "bench") {
}

if (!command || command === "compare") {
}
