import { useEffect, useState } from "react"
import { ExportModal } from "@/components/export-modal"
import {
	canvasToBlob,
	getEstimatedExportSize,
	getExportDims,
	isGifFile,
} from "@/lib/meme-export"
import { getAssetUrl, loadImg, triggerDownload } from "@/lib/utils"
import type { Dims, MemeFormat, SizePreset } from "@/types"

type SelectedMemeExportModalProps = {
	selectedMeme: string
	onClose: () => void
	onTagClick: (tag: string) => void
}

const MIME_BY_FORMAT: Record<Exclude<MemeFormat, "gif">, string> = {
	png: "image/png",
	jpg: "image/jpeg",
	webp: "image/webp",
}

export function SelectedMemeExportModal({
	selectedMeme,
	onClose,
	onTagClick,
}: SelectedMemeExportModalProps) {
	const [fmt, setFmt] = useState<MemeFormat>(
		isGifFile(selectedMeme) ? "gif" : "png",
	)
	const [quality, setQuality] = useState(92)
	const [preset, setPreset] = useState<SizePreset>("original")
	const [dims, setDims] = useState<Dims>({ w: 0, h: 0, natW: 0, natH: 0 })
	const [isDownloading, setIsDownloading] = useState(false)
	const selectedMemeUrl = getAssetUrl(selectedMeme)
	const exportDims = getExportDims(preset, dims)
	const estSize = getEstimatedExportSize(fmt, exportDims, quality)

	useEffect(() => {
		let isCancelled = false

		loadImg(selectedMemeUrl)
			.then(img => {
				if (isCancelled) return

				setDims({
					w: img.naturalWidth,
					h: img.naturalHeight,
					natW: img.naturalWidth,
					natH: img.naturalHeight,
				})
			})
			.catch(error => {
				if (!isCancelled) {
					console.error("Failed to load image for dimensions", error)
				}
			})

		return () => {
			isCancelled = true
		}
	}, [selectedMemeUrl])

	const renderCanvas = async () => {
		const img = await loadImg(selectedMemeUrl)
		const { w, h } = exportDims
		const canvas = document.createElement("canvas")
		canvas.width = w
		canvas.height = h
		const ctx = canvas.getContext("2d")
		if (!ctx) return null

		if (fmt === "jpg") {
			ctx.fillStyle = "#ffffff"
			ctx.fillRect(0, 0, w, h)
		}

		ctx.drawImage(img, 0, 0, w, h)
		return canvas
	}

	const handleDownload = async () => {
		setIsDownloading(true)

		try {
			if (fmt === "gif") {
				triggerDownload(selectedMemeUrl, selectedMeme)
				return
			}

			const canvas = await renderCanvas()
			if (!canvas) return

			const q =
				fmt === "jpg" || fmt === "webp" ? quality / 100 : undefined
			const blob = await canvasToBlob(canvas, MIME_BY_FORMAT[fmt], q)
			if (!blob) return

			const url = URL.createObjectURL(blob)
			triggerDownload(
				url,
				selectedMeme.replace(/\.[^.]+$/, "") + "." + fmt,
			)
			setTimeout(() => URL.revokeObjectURL(url), 3000)
		} catch (error) {
			console.error(error)
		} finally {
			setIsDownloading(false)
		}
	}

	return (
		<ExportModal
			selectedMeme={selectedMeme}
			onClose={onClose}
			fmt={fmt}
			setFmt={setFmt}
			quality={quality}
			setQuality={setQuality}
			preset={preset}
			setPreset={setPreset}
			dims={exportDims}
			estSize={estSize}
			isDownloading={isDownloading}
			onDownload={handleDownload}
			onTagClick={onTagClick}
		/>
	)
}
