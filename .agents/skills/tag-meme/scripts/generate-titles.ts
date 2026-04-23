import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readdirSync,
	rmSync,
	writeFileSync,
} from "node:fs"
import { dirname, join } from "node:path"

type Options = {
	assetsDir: string
	previewDir: string
	aliasDir: string
	outPath: string
	batchSize: number
	onlyGifs: boolean
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const parseArgs = (): Options => {
	const args = process.argv.slice(2)
	const getArg = (name: string, fallback: string) => {
		const index = args.indexOf(name)
		return index === -1 ? fallback : (args[index + 1] ?? fallback)
	}
	const hasFlag = (name: string) => args.includes(name)

	return {
		assetsDir: getArg("--assets-dir", "public/assets"),
		previewDir: getArg("--preview-dir", "tmp/tag-meme/previews"),
		aliasDir: getArg("--alias-dir", "tmp/tag-meme/title-previews-id"),
		outPath: getArg("--out-path", "tmp/tag-meme/titles.generated.json"),
		batchSize: Number(getArg("--batch-size", "6")),
		onlyGifs: !hasFlag("--all-assets"),
	}
}

const extractJson = (text: string) => {
	const fenced = text.match(/```json\s*([\s\S]*?)```/)
	const raw = fenced
		? fenced[1]
		: text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)
	return JSON.parse(raw) as Record<string, string>
}

const options = parseArgs()

if (!existsSync(options.previewDir)) {
	throw new Error(`missing ${options.previewDir}; run build-previews first`)
}

const files = readdirSync(options.assetsDir)
	.filter(file =>
		options.onlyGifs ? file.toLowerCase().endsWith(".gif") : true,
	)
	.sort((a, b) => a.localeCompare(b))

rmSync(options.aliasDir, { recursive: true, force: true })
mkdirSync(options.aliasDir, { recursive: true })
mkdirSync(dirname(options.outPath), { recursive: true })

const aliasToFile = new Map<string, string>()

files.forEach((file, index) => {
	const alias = `img${String(index + 1).padStart(3, "0")}`
	copyFileSync(
		join(options.previewDir, `${file}.png`),
		join(options.aliasDir, `${alias}.png`),
	)
	aliasToFile.set(alias, file)
})

const runBatch = async (
	aliases: string[],
	attempt = 1,
): Promise<Record<string, string>> => {
	const prompt = [
		"Inspect these workspace PNG files by actual visible content.",
		"Each PNG is preview for meme asset, often 3x2 GIF contact sheet.",
		"Write short user-facing title from pixels only, not filenames.",
		"",
		"Files:",
		...aliases.map(alias => `- ${options.aliasDir}/${alias}.png`),
		"",
		"Output JSON object only.",
		"Keys must be alias names exactly as listed, without .png.",
		"Values must be concise titles in Title Case.",
		"Rules:",
		"- 2 to 5 words.",
		"- readable UI label, not search tags.",
		"- avoid generic labels like Reaction Gif or Funny Meme.",
		"- if person or character recognizable, include name.",
		"- if not recognizable, describe visible expression or action.",
		"- do not use filename words unless visually justified.",
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
		const result: Record<string, string> = {}
		for (const alias of aliases) {
			const title = parsed[alias]
			if (typeof title !== "string" || !title.trim()) {
				throw new Error(`missing title for ${alias}`)
			}
			result[aliasToFile.get(alias)!] = title.trim()
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

const merged: Record<string, string> = {}

for (let start = 0; start < files.length; start += options.batchSize) {
	const aliases = files
		.slice(start, start + options.batchSize)
		.map((_, index) => `img${String(start + index + 1).padStart(3, "0")}`)

	const batch = await runBatch(aliases)
	Object.assign(merged, batch)
	writeFileSync(options.outPath, JSON.stringify(merged, null, 2) + "\n")
	console.log(
		`wrote title checkpoint ${Math.min(start + options.batchSize, files.length)}/${files.length}`,
	)
}

console.log(options.outPath)
