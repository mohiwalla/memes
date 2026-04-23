import type { Dims, MemeFormat, SizePreset } from "@/types"

export const isGifFile = (name: string) => name.toLowerCase().endsWith(".gif")

export const getDimsForPreset = (
	preset: SizePreset,
	natW: number,
	natH: number,
) => {
	const aspect = natW / natH

	if (preset === "sm") {
		return { w: 240, h: Math.round(240 / aspect) }
	}

	if (preset === "md") {
		return { w: 480, h: Math.round(480 / aspect) }
	}

	if (preset === "lg") {
		return { w: 800, h: Math.round(800 / aspect) }
	}

	if (preset === "sq") {
		return { w: 512, h: 512 }
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
		return fmt === "gif" ? "original" : "—"
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
