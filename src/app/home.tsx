import { useEffect, useMemo, useRef, useState } from "react"
import { ExportModal } from "../components/export-modal"
import { Footer } from "../components/footer"
import { Header } from "../components/header"
import { GridUI } from "../components/grid-ui"
import { loadImg, triggerDownload, searchMemes } from "@/lib/utils"
import { parseAsString, useQueryStates } from "nuqs"
import type { Dims, MemeFormat, SizePreset } from "@/types"

const getDimsForPreset = (preset: SizePreset, natW: number, natH: number) => {
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

const isGifFile = (name: string) => name.toLowerCase().endsWith(".gif")
const getHistoryIndex = () =>
	typeof window === "undefined" ? null : (window.history.state?.idx ?? null)

type SelectedMemeExportModalProps = {
	selectedMeme: string
	onClose: () => void
	onTagClick: (tag: string) => void
}

const canvasToBlob = (
	canvas: HTMLCanvasElement,
	type: string,
	quality?: number,
) =>
	new Promise<Blob | null>(resolve => {
		canvas.toBlob(resolve, type, quality)
	})

function SelectedMemeExportModal({
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

	useEffect(() => {
		let isCancelled = false

		loadImg(`/assets/${selectedMeme}`)
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
					console.error(
						"Failed to load image for dimensions",
						error,
					)
				}
			})

		return () => {
			isCancelled = true
		}
	}, [selectedMeme])

	const { natW, natH } = dims
	const exportDims =
		natW && natH
			? { ...getDimsForPreset(preset, natW, natH), natW, natH }
			: { w: 0, h: 0, natW, natH }

	const estSize = (() => {
		const { w, h } = exportDims
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
	})()

	const renderCanvas = async () => {
		const img = await loadImg(`/assets/${selectedMeme}`)
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
				triggerDownload(`/assets/${selectedMeme}`, selectedMeme)
			} else {
				const canvas = await renderCanvas()
				if (!canvas) {
					setIsDownloading(false)
					return
				}
				const mime = {
					png: "image/png",
					jpg: "image/jpeg",
					webp: "image/webp",
				}[fmt]
				const q =
					fmt === "jpg" || fmt === "webp" ? quality / 100 : undefined

				const blob = await canvasToBlob(canvas, mime, q)
				if (!blob) {
					setIsDownloading(false)
					return
				}
				const url = URL.createObjectURL(blob)
				const ext = fmt
				triggerDownload(
					url,
					selectedMeme.replace(/\.[^.]+$/, "") + "." + ext,
				)
				setTimeout(() => URL.revokeObjectURL(url), 3000)
				setIsDownloading(false)
				return
			}
		} catch (e) {
			console.error(e)
		}
		setIsDownloading(false)
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

export default function HomePage() {
	const [images, setImages] = useState<string[]>([])
	const [{ search, selectedMeme }, setUrlState] = useQueryStates(
		{
			search: parseAsString.withDefault(""),
			selectedMeme: parseAsString,
		},
		{
			urlKeys: {
				search: "q",
				selectedMeme: "meme",
			},
		},
	)
	const dismissibleModalHistoryEntriesRef = useRef(new Set<number>())

	useEffect(() => {
		fetch("/list.json")
			.then(res => res.json())
			.then(data => setImages(data))
			.catch(console.error)
	}, [])

	const filtered = useMemo(() => {
		return searchMemes(images, search)
	}, [images, search])

	const handleSearchChange = (value: string) => {
		void setUrlState({ search: value || null })
	}

	const handleTagClick = (tag: string) => {
		void setUrlState(
			{
				search: tag,
				selectedMeme: null,
			},
			{ history: "push" },
		)
	}

	const openModal = (name: string) => {
		const currentHistoryIndex = getHistoryIndex()
		if (currentHistoryIndex !== null) {
			dismissibleModalHistoryEntriesRef.current.add(currentHistoryIndex + 1)
		}

		void setUrlState({ selectedMeme: name }, { history: "push" })
	}

	const closeModal = () => {
		const currentHistoryIndex = getHistoryIndex()

		if (
			currentHistoryIndex !== null &&
			dismissibleModalHistoryEntriesRef.current.has(currentHistoryIndex)
		) {
			window.history.back()
			return
		}

		void setUrlState({ selectedMeme: null })
	}

	useEffect(() => {
		if (!selectedMeme) return

		if (images.length > 0 && !images.includes(selectedMeme)) {
			void setUrlState({ selectedMeme: null })
		}
	}, [images, selectedMeme, setUrlState])

	return (
		<div className="min-h-screen">
			<Header
				search={search}
				onSearchChange={handleSearchChange}
				filteredCount={filtered.length}
			/>

			<GridUI
				cols={4}
				items={filtered}
				search={search}
				onOpenMeme={openModal}
			/>

			<Footer memeCount={filtered.length} />

			{selectedMeme && (
				<SelectedMemeExportModal
					key={selectedMeme}
					selectedMeme={selectedMeme}
					onClose={closeModal}
					onTagClick={handleTagClick}
				/>
			)}
		</div>
	)
}
