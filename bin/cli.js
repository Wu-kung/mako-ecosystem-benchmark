import { existsSync } from "node:fs";
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
  await $`cargo build --release`;

  cd(cwd);
}

if (!command || command === "bench") {
  cd(makoDirectory);

  const baselineHash = (await $`git rev-parse --short HEAD`).stdout.trim();
  const baselineMakoPath = `./tmp/mako-${baselineHash}`;
  if (!existsSync(join(__dirname, `../tmp/mako-${baselineHash}`))) {
    if (shouldBuild) {
      await $`cargo build --release`;
      await $`cp target/release/mako ${baselineMakoPath}`;
    } else {
      console.log(`Since --no-build is set, build for baseline is skipped.`);
    }
  }

  let currentMakoPath = "./target/release/mako";
  const currentHash = (await $`git rev-parse --short HEAD`).stdout.trim();
  const makoCurrentName = `mako-${currentHash}`;
  await $`cp target/release/mako ./tmp/${makoCurrentName}`;
  currentMakoPath = `./tmp/${makoCurrentName}`;

  const warmup = argv.warmup || 3;
  const runs = argv.runs || 10;
  await $`hyperfine --warmup ${warmup} --runs ${runs} "${currentMakoPath} ${casePath} --mode production" "${baselineMakoPath} ${casePath} --mode production"`;
}
