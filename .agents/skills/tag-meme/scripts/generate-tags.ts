import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	rmSync,
	writeFileSync,
} from "node:fs"
import { dirname, join } from "node:path"

type Options = {
	assetsDir: string
	previewDir: string
	aliasDir: string
	dbPath: string
	outPath: string
	batchSize: number
	limit?: number
	resume: boolean
	applyAfterBatch: boolean
}

type MemeDatabaseEntry = {
	tags?: string[]
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const parseArgs = (): Options => {
	const args = process.argv.slice(2)
	const getArg = (name: string, fallback?: string) => {
		const index = args.indexOf(name)
		return index === -1 ? fallback : args[index + 1]
	}
	const hasFlag = (name: string) => args.includes(name)

	return {
		assetsDir: getArg("--assets-dir", "public/assets")!,
		previewDir: getArg("--preview-dir", "tmp/tag-meme/previews")!,
		aliasDir: getArg("--alias-dir", "tmp/tag-meme/previews-id")!,
		dbPath: getArg("--db-path", "src/lib/memes-database.ts")!,
		outPath: getArg("--out-path", "tmp/tag-meme/tags.generated.json")!,
		batchSize: Number(getArg("--batch-size", "6")),
		limit: getArg("--limit") ? Number(getArg("--limit")) : undefined,
		resume: hasFlag("--resume"),
		applyAfterBatch: hasFlag("--apply-after-batch"),
	}
}

const loadExistingDbKeys = (dbPath: string) =>
	new Set(
		Object.entries(
			Function(
				`return ${readFileSync(dbPath, "utf8").split("export const MEMES_DATABASE: Record<string, MemeDatabaseEntry> = ")[1]}`,
			)() as Record<string, MemeDatabaseEntry>,
		)
			.filter(([, entry]) => entry.tags?.length)
			.map(([file]) => file),
	)

const loadCheckpoint = (path: string) => {
	if (!existsSync(path)) return {} as Record<string, string[]>
	return JSON.parse(readFileSync(path, "utf8")) as Record<string, string[]>
}

const extractJson = (text: string) => {
	const fenced = text.match(/```json\s*([\s\S]*?)```/)
	const raw = fenced
		? fenced[1]
		: text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)
	return JSON.parse(raw) as Record<string, string[]>
}

const options = parseArgs()
const allAssets = readdirSync(options.assetsDir).sort((a, b) =>
	a.localeCompare(b),
)
const existingDbKeys = loadExistingDbKeys(options.dbPath)
const checkpoint = options.resume ? loadCheckpoint(options.outPath) : {}
const doneKeys = new Set([...existingDbKeys, ...Object.keys(checkpoint)])

let remaining = allAssets.filter(file => !doneKeys.has(file))
if (options.limit) remaining = remaining.slice(0, options.limit)

rmSync(options.aliasDir, { recursive: true, force: true })
mkdirSync(options.aliasDir, { recursive: true })
mkdirSync(dirname(options.outPath), { recursive: true })

const aliasToFile = new Map<string, string>()

remaining.forEach((file, index) => {
	const alias = `img${String(index + 1).padStart(3, "0")}`
	copyFileSync(
		join(options.previewDir, `${file}.png`),
		join(options.aliasDir, `${alias}.png`),
	)
	aliasToFile.set(alias, file)
})

const merged = { ...checkpoint }

const runBatch = async (
	aliases: string[],
	attempt = 1,
): Promise<Record<string, string[]>> => {
	const prompt = [
		"Inspect these workspace PNG files by actual visible content.",
		"Some are still images. Some are 3x2 frame sheets extracted from GIFs.",
		"Infer meme search tags from pixels only, not from filenames.",
		"",
		"Files:",
		...aliases.map(alias => `- ${options.aliasDir}/${alias}.png`),
		"",
		"Output JSON object only.",
		"Keys must be alias names exactly as listed, without .png.",
		"Rules:",
		"- 6 to 8 tags per file.",
		"- lowercase.",
		"- mix identifiable subject/source, visible expression/action, and likely meme use-case search intent.",
		"- no generic filler like meme, gif, image, reaction.",
		"- if identity unclear, use descriptive visual tags instead of guessing.",
		"- do not infer tags from file names.",
	].join("\n")

	const proc = Bun.spawnSync(
		["gemini", "-p", prompt, "--output-format", "text", "--yolo"],
		{
			cwd: process.cwd(),
			stdout: "pipe",
			stderr: "pipe",
		},
	)

	const stdout = new TextDecoder().decode(proc.stdout)
	const stderr = new TextDecoder().decode(proc.stderr)

	if (proc.exitCode !== 0) {
		if (attempt < 4) {
			await sleep(attempt * 7000)
			return runBatch(aliases, attempt + 1)
		}
		throw new Error(stderr || stdout)
	}

	try {
		const parsed = extractJson(stdout)
		const result: Record<string, string[]> = {}

		for (const alias of aliases) {
			const tags = parsed[alias]
			if (!Array.isArray(tags)) throw new Error(`missing alias ${alias}`)
			result[aliasToFile.get(alias)!] = tags.map(tag =>
				String(tag).trim().toLowerCase(),
			)
		}

		return result
	} catch (error) {
		if (attempt < 4) {
			await sleep(attempt * 5000)
			return runBatch(aliases, attempt + 1)
		}
		throw error
	}
}

for (let start = 0; start < remaining.length; start += options.batchSize) {
	const aliases = remaining
		.slice(start, start + options.batchSize)
		.map((_, index) => `img${String(start + index + 1).padStart(3, "0")}`)

	const batch = await runBatch(aliases)
	Object.assign(merged, batch)
	writeFileSync(options.outPath, JSON.stringify(merged, null, 2) + "\n")

	if (options.applyAfterBatch) {
		const applyProc = Bun.spawnSync(
			[
				"bun",
				".agents/skills/tag-meme/scripts/write-tags-database.ts",
				"--db-path",
				options.dbPath,
				"--input-path",
				options.outPath,
			],
			{
				cwd: process.cwd(),
				stdout: "inherit",
				stderr: "inherit",
			},
		)

		if (applyProc.exitCode !== 0) {
			throw new Error("failed applying batch to tags database")
		}
	}

	console.log(
		`wrote checkpoint ${Math.min(start + options.batchSize, remaining.length)}/${remaining.length}`,
	)
}

console.log(options.outPath)
