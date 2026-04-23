import { readFileSync, writeFileSync } from "node:fs"

type Options = {
	dbPath: string
	inputPath: string
}

const parseArgs = (): Options => {
	const args = process.argv.slice(2)
	const getArg = (name: string, fallback: string) => {
		const index = args.indexOf(name)
		return index === -1 ? fallback : (args[index + 1] ?? fallback)
	}

	return {
		dbPath: getArg("--db-path", "src/lib/tags-database.ts"),
		inputPath: getArg("--input-path", "tmp/tag-meme/tags.generated.json"),
	}
}

const options = parseArgs()
const banned = new Set(["reaction", "meme", "gif", "image"])

const currentText = readFileSync(options.dbPath, "utf8")
const currentDb = Function(
	currentText.replace(
		/export const TAGS_DATABASE: Record<string, string\[]> = /,
		"return ",
	),
)() as Record<string, string[]>

const generated = JSON.parse(
	readFileSync(options.inputPath, "utf8"),
) as Record<string, string[]>

const merged: Record<string, string[]> = { ...currentDb }

for (const [file, tags] of Object.entries(generated)) {
	merged[file] = Array.from(
		new Set(
			tags
				.map(tag => String(tag).trim().toLowerCase())
				.filter(Boolean)
				.filter(tag => !banned.has(tag)),
		),
	)
}

const lines = ['export const TAGS_DATABASE: Record<string, string[]> = {']
for (const [file, tags] of Object.entries(merged).sort(([a], [b]) =>
	a.localeCompare(b),
)) {
	lines.push(`\t${JSON.stringify(file)}: [`)
	for (const tag of tags) {
		lines.push(`\t\t${JSON.stringify(tag)},`)
	}
	lines.push("\t],")
}
lines.push("}")

writeFileSync(options.dbPath, lines.join("\n") + "\n")
console.log(`updated ${options.dbPath}`)
