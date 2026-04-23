import { mkdirSync, readdirSync, rmSync } from "node:fs"
import { dirname, join } from "node:path"

type Options = {
	assetsDir: string
	outDir: string
}

const parseArgs = (): Options => {
	const args = process.argv.slice(2)
	const getArg = (name: string, fallback: string) => {
		const index = args.indexOf(name)
		return index === -1 ? fallback : (args[index + 1] ?? fallback)
	}

	return {
		assetsDir: getArg("--assets-dir", "public/assets"),
		outDir: getArg("--out-dir", "tmp/tag-meme/previews"),
	}
}

const run = (cmd: string[]) => {
	const proc = Bun.spawnSync(cmd, {
		cwd: process.cwd(),
		stdout: "pipe",
		stderr: "pipe",
	})

	if (proc.exitCode !== 0) {
		const stderr = new TextDecoder().decode(proc.stderr).trim()
		throw new Error(`${cmd[0]} failed: ${stderr}`)
	}
}

const options = parseArgs()
rmSync(options.outDir, { recursive: true, force: true })
mkdirSync(dirname(options.outDir), { recursive: true })
mkdirSync(options.outDir, { recursive: true })

const files = readdirSync(options.assetsDir).sort((a, b) => a.localeCompare(b))

for (const file of files) {
	const input = join(options.assetsDir, file)
	const output = join(options.outDir, `${file}.png`)
	const ext = file.split(".").pop()?.toLowerCase()

	if (ext === "gif") {
		const probe = Bun.spawnSync(
			[
				"ffprobe",
				"-v",
				"error",
				"-show_entries",
				"format=duration",
				"-of",
				"default=nw=1:nk=1",
				input,
			],
			{
				cwd: process.cwd(),
				stdout: "pipe",
				stderr: "pipe",
			},
		)
		const duration = new TextDecoder().decode(probe.stdout).trim() || "1"

		run([
			"ffmpeg",
			"-v",
			"error",
			"-y",
			"-i",
			input,
			"-vf",
			`fps=6/${duration},scale=240:-1:flags=lanczos,tile=3x2`,
			"-frames:v",
			"1",
			output,
		])
		continue
	}

	run([
		"sips",
		"-s",
		"format",
		"png",
		"--resampleHeightWidthMax",
		"480",
		input,
		"--out",
		output,
	])
}

console.log(`built ${files.length} previews in ${options.outDir}`)
