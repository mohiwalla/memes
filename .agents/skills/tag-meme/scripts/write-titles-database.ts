import { readFileSync, writeFileSync } from "node:fs"

type Options = {
	inputPath: string
	dbPath: string
}

const parseArgs = (): Options => {
	const args = process.argv.slice(2)
	const getArg = (name: string, fallback: string) => {
		const index = args.indexOf(name)
		return index === -1 ? fallback : (args[index + 1] ?? fallback)
	}

	return {
		inputPath: getArg("--input-path", "tmp/tag-meme/titles.generated.json"),
		dbPath: getArg("--db-path", "src/lib/titles-database.ts"),
	}
}

const cleanTitle = (value: string) =>
	value
		.replace(/\b(?:Meme|Reaction|Gif)\b/g, "")
		.replace(/\s+/g, " ")
		trim()

const options = parseArgs()
const source = JSON.parse(
	readFileSync(options.inputPath, "utf8"),
) as Record<string, string>

const lines = ['export const TITLES_DATABASE: Record<string, string> = {']

for (const [file, title] of Object.entries(source).sort(([a], [b]) =>
	a.localeCompare(b),
)) {
	lines.push(`\t${JSON.stringify(file)}: ${JSON.stringify(cleanTitle(title))},`)
}

lines.push("}")

writeFileSync(options.dbPath, lines.join("\n") + "\n")
console.log(`updated ${options.dbPath}`)
