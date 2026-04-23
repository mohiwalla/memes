import type { Dims, MemeFormat, SizePreset } from "@/types"

export const isGifFile = (name: string) => name.toLowerCase().endsWith(".gif")
export const DEFAULT_EXPORT_QUALITY = 92

export const formatBytes = (bytes: number) => {
	if (!Number.isFinite(bytes) || bytes <= 0) return "—"

	const units = ["B", "KB", "MB", "GB"] as const
	let value = bytes
	let unitIndex = 0

	while (value >= 1024 && unitIndex < units.length - 1) {
		value /= 1024
		unitIndex += 1
	}

	if (unitIndex === 0) return `${bytes} ${units[unitIndex]}`

	return `${value >= 10 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`
}

const scaleDims = (natW: number, natH: number, scale: number) => ({
	w: Math.max(1, Math.round(natW * scale)),
	h: Math.max(1, Math.round(natH * scale)),
})

export const getDimsForPreset = (
	preset: SizePreset,
	natW: number,
	natH: number,
) => {
	if (preset === "emoji") {
		return { w: 50, h: 50 }
	}

	if (preset === "small") {
		return scaleDims(natW, natH, 0.25)
	}

	if (preset === "medium") {
		return scaleDims(natW, natH, 0.5)
	}

	return { w: natW, h: natH }
}

export const getExportDims = (
	preset: SizePreset,
	{ natW, natH }: Pick<Dims, "natW" | "natH">,
): Dims =>
	natW && natH
		? { ...getDimsForPreset(preset, natW, natH), natW, natH }
		: { w: 0, h: 0, natW, natH }

export const getEstimatedExportSize = (
	fmt: MemeFormat,
	{ w, h }: Pick<Dims, "w" | "h">,
	quality: number,
) => {
	if (!w || !h || fmt === "gif") {
		return "—"
	}

	const px = w * h
	const q = quality / 100
	let kb = 0

	if (fmt === "jpg") kb = Math.round((px * q * 0.18) / 1024)
	else if (fmt === "webp") kb = Math.round((px * q * 0.12) / 1024)
	else if (fmt === "png") kb = Math.round((px * 0.7) / 1024)

	return kb < 1024 ? `${kb} KB` : `${(kb / 1024).toFixed(1)} MB`
}

export const canvasToBlob = (
	canvas: HTMLCanvasElement,
	type: string,
	quality?: number,
) =>
	new Promise<Blob | null>(resolve => {
		canvas.toBlob(resolve, type, quality)
	})
