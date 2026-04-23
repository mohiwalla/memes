import fs from "fs/promises"
import path from "path"
import { defineConfig } from "vite"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import babel from "@rolldown/plugin-babel"
import tailwindcss from "@tailwindcss/vite"

const MEME_ASSETS_DIR = path.resolve(__dirname, "./public/assets")

const listFiles = async (dir: string, baseDir = dir): Promise<string[]> => {
	const entries = await fs.readdir(dir, { withFileTypes: true })

	const files = await Promise.all(
		entries.map(async entry => {
			const fullPath = path.join(dir, entry.name)
			if (entry.isDirectory()) return listFiles(fullPath, baseDir)
			if (entry.isFile()) return [path.relative(baseDir, fullPath)]
			return []
		}),
	)

	return files.flat()
}

const excludeMemeAssetsFromDist = () => ({
	name: "exclude-meme-assets-from-dist",
	apply: "build" as const,
	async closeBundle() {
		try {
			const memeAssets = await listFiles(MEME_ASSETS_DIR)
			const distAssetsDir = path.resolve(__dirname, "./dist/assets")

			await Promise.all(
				memeAssets.map(asset =>
					fs.rm(path.join(distAssetsDir, asset), { force: true }),
				),
			)
		} catch (error) {
			if (
				error &&
				typeof error === "object" &&
				"code" in error &&
				error.code === "ENOENT"
			) {
				return
			}

			throw error
		}
	},
})

export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	plugins: [
		react(),
		babel({ presets: [reactCompilerPreset()] }),
		tailwindcss(),
		// Runtime serves meme files from CDN, so strip copied public/assets files.
		excludeMemeAssetsFromDist(),
	],
})
