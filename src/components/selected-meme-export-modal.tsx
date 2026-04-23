import { useEffect, useRef, useState } from "react"
import confetti from "canvas-confetti"
import { ExportModal } from "@/components/export-modal"
import {
	canvasToBlob,
	DEFAULT_EXPORT_QUALITY,
	formatBytes,
	getEstimatedExportSize,
	getExportDims,
	isGifFile,
} from "@/lib/meme-export"
import {
	downloadFile,
	getAssetUrl,
	loadImg,
	makeTitle,
	triggerDownload,
} from "@/lib/utils"
import type { Dims, DownloadOrigin, MemeFormat, SizePreset } from "@/types"

type SelectedMemeExportModalProps = {
	selectedMeme: string
	onClose: () => void
	onTagClick: (tag: string) => void
}

const MIME_BY_FORMAT: Record<MemeFormat, string> = {
	gif: "image/gif",
	png: "image/png",
	jpg: "image/jpeg",
	webp: "image/webp",
}

type DownloadStatus = "idle" | "rendering" | "success"

const fireDownloadConfetti = (origin: DownloadOrigin) => {
	const prefersReducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches

	if (prefersReducedMotion) return

	void confetti({
		particleCount: 34,
		spread: 42,
		startVelocity: 24,
		scalar: 0.72,
		ticks: 110,
		origin,
		colors: ["#ff4fa3", "#ffd23f", "#1a1630", "#ffffff"],
		disableForReducedMotion: true,
	})
}

export function SelectedMemeExportModal({
	selectedMeme,
	onClose,
	onTagClick,
}: SelectedMemeExportModalProps) {
	const [fmt, setFmt] = useState<MemeFormat>(
		isGifFile(selectedMeme) ? "gif" : "png",
	)
	const [preset, setPreset] = useState<SizePreset>("original")
	const [dims, setDims] = useState<Dims>({ w: 0, h: 0, natW: 0, natH: 0 })
	const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>("idle")
	const [sourceFileSize, setSourceFileSize] = useState("—")
	const successTimerRef = useRef<number | null>(null)
	const selectedMemeUrl = getAssetUrl(selectedMeme)
	const canShare =
		typeof navigator !== "undefined" &&
		typeof navigator.share === "function" &&
		typeof File === "function" &&
		(() => {
			if (typeof navigator.canShare !== "function") return true

			try {
				return navigator.canShare({
					files: [
						new File([""], `share.${fmt}`, {
							type: MIME_BY_FORMAT[fmt],
						}),
					],
				})
			} catch {
				return false
			}
		})()
	const exportDims = getExportDims(preset, dims)
	const estSize =
		fmt === "gif"
			? sourceFileSize
			: getEstimatedExportSize(fmt, exportDims, DEFAULT_EXPORT_QUALITY)
	const isDownloading = downloadStatus === "rendering"

	useEffect(() => {
		return () => {
			if (successTimerRef.current) {
				window.clearTimeout(successTimerRef.current)
				successTimerRef.current = null
			}
		}
	}, [])

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

	useEffect(() => {
		let isCancelled = false

		setSourceFileSize("—")

		if (!isGifFile(selectedMeme)) {
			return () => {
				isCancelled = true
			}
		}

		fetch(selectedMemeUrl)
			.then(async response => {
				if (!response.ok) {
					throw new Error(
						`Failed to load file size: ${response.status}`,
					)
				}

				const contentLength = response.headers.get("content-length")
				if (contentLength) return Number(contentLength)

				const blob = await response.blob()
				return blob.size
			})
			.then(size => {
				if (!isCancelled) setSourceFileSize(formatBytes(size))
			})
			.catch(error => {
				if (!isCancelled) {
					console.error("Failed to load GIF file size", error)
				}
			})

		return () => {
			isCancelled = true
		}
	}, [selectedMeme, selectedMemeUrl])

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

	const getExportFilename = () =>
		fmt === "gif"
			? selectedMeme
			: `${selectedMeme.replace(/\.[^.]+$/, "")}.${fmt}`

	const createExportBlob = async () => {
		if (fmt === "gif") {
			const response = await fetch(selectedMemeUrl)
			if (!response.ok) {
				throw new Error(`Failed to load share file: ${response.status}`)
			}

			return response.blob()
		}

		const canvas = await renderCanvas()
		if (!canvas) return null

		const q =
			fmt === "jpg" || fmt === "webp"
				? DEFAULT_EXPORT_QUALITY / 100
				: undefined

		return canvasToBlob(canvas, MIME_BY_FORMAT[fmt], q)
	}

	const showDownloadSuccess = (origin: DownloadOrigin) => {
		if (successTimerRef.current) {
			window.clearTimeout(successTimerRef.current)
			successTimerRef.current = null
		}

		setDownloadStatus("success")
		fireDownloadConfetti(origin)
		successTimerRef.current = window.setTimeout(() => {
			setDownloadStatus("idle")
			successTimerRef.current = null
		}, 1600)
	}

	const handleDownload = async (origin: DownloadOrigin) => {
		if (isDownloading) return

		if (successTimerRef.current) {
			window.clearTimeout(successTimerRef.current)
			successTimerRef.current = null
		}

		setDownloadStatus("rendering")
		let didDownload = false

		try {
			if (fmt === "gif") {
				await downloadFile(selectedMemeUrl, selectedMeme)
				didDownload = true
				return
			}

			const blob = await createExportBlob()
			if (!blob) return

			const url = URL.createObjectURL(blob)
			triggerDownload(url, getExportFilename())
			didDownload = true
			setTimeout(() => URL.revokeObjectURL(url), 3000)
		} catch (error) {
			console.error(error)
		} finally {
			if (didDownload) {
				showDownloadSuccess(origin)
			} else {
				setDownloadStatus("idle")
			}
		}
	}

	const handleShare = async () => {
		if (!canShare || isDownloading) return

		try {
			const blob = await createExportBlob()
			if (!blob) return

			const file = new File([blob], getExportFilename(), {
				type: blob.type || MIME_BY_FORMAT[fmt],
			})

			if (
				typeof navigator.canShare === "function" &&
				!navigator.canShare({ files: [file] })
			) {
				return
			}

			await navigator.share({
				title: makeTitle(selectedMeme),
				files: [file],
			})
		} catch (error) {
			if (
				error instanceof DOMException &&
				error.name === "AbortError"
			) {
				return
			}

			console.error("Failed to share meme", error)
		}
	}

	return (
		<ExportModal
			selectedMeme={selectedMeme}
			onClose={onClose}
			fmt={fmt}
			setFmt={setFmt}
			preset={preset}
			setPreset={setPreset}
			dims={exportDims}
			estSize={estSize}
			isDownloading={isDownloading}
			downloadStatus={downloadStatus}
			canShare={canShare}
			onDownload={handleDownload}
			onShare={handleShare}
			onTagClick={onTagClick}
		/>
	)
}
