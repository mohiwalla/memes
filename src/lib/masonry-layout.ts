import { MEMES_DIMENSIONS } from "@/lib/memes-dimensions"

export type MasonryTile = {
	name: string
	x: number
	y: number
	width: number
	height: number
}

export type MasonryLayout = {
	cols: number
	gap: number
	height: number
	tiles: MasonryTile[]
}

type LayoutOptions = {
	width: number
	measuredRatios: Record<string, number>
}

const MIN_COLUMN_WIDTH_PX = 250
const MIN_TWO_COLUMN_WIDTH_PX = 340
const DESKTOP_GAP_PX = 22
const MOBILE_GAP_PX = 12
const MOBILE_BREAKPOINT_PX = 640
const MIN_IMAGE_RATIO = 0.42
const MAX_IMAGE_RATIO = 1.9
const DEFAULT_IMAGE_RATIO = 0.75
const WIDE_TILE_MAX_RATIO = 0.8
const WIDE_TILE_MIN_COLS = 3
const WIDE_TILE_EVERY = 2
// Largest height step between two columns a wide tile may bridge. The step is
// closed by stretching the shorter column's last tile, so it must stay small.
const WIDE_TILE_MAX_STEP_PX = 32
// How many single tiles a wide tile may wait behind for a level column pair.
const WIDE_TILE_MAX_DEFER = 6
// Border (2 × 2.5px) + top padding (10px) + title row (44px).
export const TILE_CHROME_HEIGHT_PX = 59
// Border (2 × 2.5px) + horizontal padding (2 × 10px).
const TILE_CHROME_WIDTH_PX = 25

const hashName = (name: string) => {
	let hash = 0
	for (let i = 0; i < name.length; i++) {
		hash = (hash * 31 + name.charCodeAt(i)) | 0
	}
	return Math.abs(hash)
}

export const getImageRatio = (
	name: string,
	measuredRatios: Record<string, number>,
) => {
	const dimensions = MEMES_DIMENSIONS[name]
	const ratio = dimensions
		? dimensions.h / dimensions.w
		: (measuredRatios[name] ?? DEFAULT_IMAGE_RATIO)

	return Math.min(MAX_IMAGE_RATIO, Math.max(MIN_IMAGE_RATIO, ratio))
}

export const getColumnCount = (width: number, gap: number) => {
	const fitted = Math.floor((width + gap) / (MIN_COLUMN_WIDTH_PX + gap))
	const minimum = width >= MIN_TWO_COLUMN_WIDTH_PX ? 2 : 1
	return Math.max(minimum, fitted)
}

// Wide landscape memes span two columns for a bento rhythm. Picked by name
// hash so a meme keeps its shape across searches.
const isWideTile = (name: string, ratio: number, cols: number) =>
	cols >= WIDE_TILE_MIN_COLS &&
	ratio <= WIDE_TILE_MAX_RATIO &&
	hashName(name) % WIDE_TILE_EVERY === 0

export function computeMasonryLayout(
	items: string[],
	{ width, measuredRatios }: LayoutOptions,
): MasonryLayout {
	const gap = width < MOBILE_BREAKPOINT_PX ? MOBILE_GAP_PX : DESKTOP_GAP_PX
	const cols = getColumnCount(width, gap)
	const columnWidth = (width - gap * (cols - 1)) / cols
	const columnHeights = new Array<number>(cols).fill(0)
	const tiles: MasonryTile[] = []

	if (width <= 0) return { cols, gap, height: 0, tiles }

	const lastTileIndex = new Array<number>(cols).fill(-1)

	const placeTile = (
		name: string,
		ratio: number,
		col: number,
		span: number,
	) => {
		const top = Math.max(...columnHeights.slice(col, col + span))
		const tileWidth = columnWidth * span + gap * (span - 1)
		const imageWidth = Math.max(0, tileWidth - TILE_CHROME_WIDTH_PX)
		const tileHeight = Math.round(
			imageWidth * ratio + TILE_CHROME_HEIGHT_PX,
		)

		tiles.push({
			name,
			x: Math.round(col * (columnWidth + gap)),
			y: top,
			width: Math.round(tileWidth),
			height: tileHeight,
		})

		for (let c = col; c < col + span; c++) {
			columnHeights[c] = top + tileHeight + gap
			lastTileIndex[c] = tiles.length - 1
		}
	}

	const placeSingle = (name: string, ratio: number) => {
		placeTile(
			name,
			ratio,
			columnHeights.indexOf(Math.min(...columnHeights)),
			1,
		)
	}

	// Wide tiles only land on two nearly level columns so no hole opens
	// beneath them. A small step is closed by stretching the shorter side.
	const tryPlaceWide = (name: string, ratio: number) => {
		let best: { col: number; top: number; shorter: number } | null = null

		for (let c = 0; c < cols - 1; c++) {
			const step = Math.abs(columnHeights[c] - columnHeights[c + 1])
			const shorter = columnHeights[c] < columnHeights[c + 1] ? c : c + 1
			if (step > WIDE_TILE_MAX_STEP_PX) continue
			if (step > 0 && lastTileIndex[shorter] === -1) continue

			const top = Math.max(columnHeights[c], columnHeights[c + 1])
			if (!best || top < best.top) best = { col: c, top, shorter }
		}

		if (!best) return false

		const step = best.top - columnHeights[best.shorter]
		if (step > 0) {
			tiles[lastTileIndex[best.shorter]].height += step
			columnHeights[best.shorter] = best.top
		}
		placeTile(name, ratio, best.col, 2)
		return true
	}

	let pending: { name: string; ratio: number; waited: number }[] = []
	const placePending = () => {
		pending = pending.filter(item => !tryPlaceWide(item.name, item.ratio))
	}

	for (const name of items) {
		const ratio = getImageRatio(name, measuredRatios)

		if (isWideTile(name, ratio, cols) && !tryPlaceWide(name, ratio)) {
			pending.push({ name, ratio, waited: 0 })
			continue
		}
		if (!isWideTile(name, ratio, cols)) placeSingle(name, ratio)

		placePending()
		for (const item of pending) item.waited++
		for (const item of pending.filter(
			item => item.waited > WIDE_TILE_MAX_DEFER,
		)) {
			placeSingle(item.name, item.ratio)
		}
		pending = pending.filter(item => item.waited <= WIDE_TILE_MAX_DEFER)
	}

	placePending()
	for (const item of pending) placeSingle(item.name, item.ratio)

	return {
		cols,
		gap,
		height: Math.max(0, Math.max(...columnHeights) - gap),
		tiles,
	}
}
