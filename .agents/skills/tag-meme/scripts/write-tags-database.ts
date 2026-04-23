import { readFileSync, writeFileSync } from "node:fs"

type Options = {
	dbPath: string
	inputPath: string
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
		dbPath: getArg("--db-path", "src/lib/memes-database.ts"),
		inputPath: getArg("--input-path", "tmp/tag-meme/tags.generated.json"),
	}
}

const options = parseArgs()
const banned = new Set(["reaction", "meme", "gif", "image"])

const makeFallbackTitle = (name: string) =>
	name
		.replace(/\.[^.]+$/, "")
		.replace(/-/g, " ")
		.replace(/\b\w/g, c => c.toUpperCase())

const currentText = readFileSync(options.dbPath, "utf8")
const currentDb = Function(
	`return ${currentText.split("export const MEMES_DATABASE: Record<string, MemeDatabaseEntry> = ")[1]}`,
)() as Record<string, MemeDatabaseEntry>

const generated = JSON.parse(readFileSync(options.inputPath, "utf8")) as Record<
	string,
	string[]
>

const merged: Record<string, MemeDatabaseEntry> = { ...currentDb }

for (const [file, tags] of Object.entries(generated)) {
	merged[file] = {
		title: currentDb[file]?.title ?? makeFallbackTitle(file),
		tags: Array.from(
			new Set(
				tags
					.map(tag => String(tag).trim().toLowerCase())
					.filter(Boolean)
					.filter(tag => !banned.has(tag)),
			),
		),
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
