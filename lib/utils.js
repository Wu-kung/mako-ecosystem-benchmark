import { spawn } from "child_process";

export const isGitHubActions = !!process.env.GITHUB_ACTIONS;

export async function runCommand(
	command,
	args,
	{ verbose = true, env, onData } = {}
) {
	const hasOnData = typeof onData === "function";
	const stdio = verbose ? "inherit" : "ignore";
	const p = spawn(command, args, {
		shell: true,
		stdio: [stdio, hasOnData ? "pipe" : stdio, "inherit"],
		env: env
			? {
					...process.env,
					...env
			  }
			: undefined
	});
	if (hasOnData) {
		p.stdout.on("data", onData);
	}

	const exitCode = await new Promise(resolve => p.once("exit", resolve));
	if (exitCode !== 0)
		throw new Error(`${command} ${args.join(" ")} failed with ${exitCode}`);
}
