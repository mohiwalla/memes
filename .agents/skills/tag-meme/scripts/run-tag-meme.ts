type Options = {
	limit?: number
	resume: boolean
	applyAfterBatch: boolean
	batchSize: number
}

const parseArgs = (): Options => {
	const args = process.argv.slice(2)
	const getArg = (name: string, fallback?: string) => {
		const index = args.indexOf(name)
		return index === -1 ? fallback : args[index + 1]
	}
	const hasFlag = (name: string) => args.includes(name)

	return {
		limit: getArg("--limit") ? Number(getArg("--limit")) : undefined,
		resume: hasFlag("--resume"),
		applyAfterBatch: hasFlag("--apply-after-batch"),
		batchSize: Number(getArg("--batch-size", "6")),
	}
}

const options = parseArgs()

const run = (cmd: string[]) => {
	const proc = Bun.spawnSync(cmd, {
		cwd: process.cwd(),
		stdout: "inherit",
		stderr: "inherit",
	})
	if (proc.exitCode !== 0) {
		throw new Error(`${cmd.join(" ")} failed`)
	}
}

run(["bun", ".agents/skills/tag-meme/scripts/build-previews.ts"])

run([
	"bun",
	".agents/skills/tag-meme/scripts/generate-tags.ts",
	"--batch-size",
	String(options.batchSize),
	...(options.resume ? ["--resume"] : []),
	...(options.applyAfterBatch ? ["--apply-after-batch"] : []),
	...(options.limit ? ["--limit", String(options.limit)] : []),
])

if (!options.applyAfterBatch) {
	run(["bun", ".agents/skills/tag-meme/scripts/write-tags-database.ts"])
}
