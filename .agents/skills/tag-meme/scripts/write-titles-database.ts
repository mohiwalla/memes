import { readFileSync, writeFileSync } from "node:fs"

type Options = {
	inputPath: string
	dbPath: string
}

type MemeDatabaseEntry = {
	title: string
	tags: string[]
}

const parseArgs = (): Options => {
	const args = process.argv.slice(2)
	const getArg = (name: string, fallback: string) => {
		const index = args.indexOf(name)
		return index === -1 ? fallback : (args[index + 1] ?? fallback)
	}

	return {
		inputPath: getArg("--input-path", "tmp/tag-meme/titles.generated.json"),
		dbPath: getArg("--db-path", "src/lib/memes-database.ts"),
	}
}

const cleanTitle = (value: string) =>
	value
		.replace(/\b(?:Meme|Reaction|Gif)\b/g, "")
		.replace(/\s+/g, " ")
		.trim()

const options = parseArgs()
const currentText = readFileSync(options.dbPath, "utf8")
const currentDb = Function(
	`return ${currentText.split("export const MEMES_DATABASE: Record<string, MemeDatabaseEntry> = ")[1]}`,
)() as Record<string, MemeDatabaseEntry>

const source = JSON.parse(readFileSync(options.inputPath, "utf8")) as Record<
	string,
	string
>

const merged: Record<string, MemeDatabaseEntry> = { ...currentDb }

for (const [file, title] of Object.entries(source)) {
	merged[file] = {
		title: cleanTitle(title),
		tags: currentDb[file]?.tags ?? [],
	}
}

const lines = [
	"export type MemeDatabaseEntry = {",
	"\ttitle: string",
	"\ttags: string[]",
	"}",
	"",
	"export const MEMES_DATABASE: Record<string, MemeDatabaseEntry> = {",
]

for (const [file, entry] of Object.entries(merged).sort(([a], [b]) =>
	a.localeCompare(b),
)) {
	lines.push(`\t${JSON.stringify(file)}: {`)
	lines.push(`\t\ttitle: ${JSON.stringify(entry.title)},`)
	lines.push("\t\ttags: [")
	for (const tag of entry.tags) {
		lines.push(`\t\t\t${JSON.stringify(tag)},`)
	}
	lines.push("\t\t],")
	lines.push("\t},")
}

lines.push("}")

writeFileSync(options.dbPath, lines.join("\n") + "\n")
console.log(`updated ${options.dbPath}`)
