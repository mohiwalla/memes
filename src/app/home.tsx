import { useEffect, useMemo, useState } from "react"
import { ExportModal } from "../components/export-modal"
import { Footer } from "../components/footer"
import { Header } from "../components/header"
import { GridUI } from "../components/grid-ui"
import { loadImg, triggerDownload, searchMemes } from "@/lib/utils"
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

export default function HomePage() {
	const [images, setImages] = useState<string[]>([])
	const [search, setSearch] = useState("")
	const [selectedMeme, setSelectedMeme] = useState<string | null>(null)

	const [fmt, setFmt] = useState<MemeFormat>("png")
	const [quality, setQuality] = useState(92)
	const [preset, setPreset] = useState<SizePreset>("original")
	const [dims, setDims] = useState<Dims>({ w: 0, h: 0, natW: 0, natH: 0 })
	const [isRendering, setIsRendering] = useState(false)

	useEffect(() => {
		fetch("/list.json")
			.then(res => res.json())
			.then(data => setImages(data))
			.catch(console.error)
	}, [])

	const filtered = useMemo(() => {
		return searchMemes(images, search)
	}, [images, search])

	const openModal = async (name: string) => {
		const gifFile = isGifFile(name)

		setSelectedMeme(name)
		setFmt(gifFile ? "gif" : "png")
		setQuality(92)
		setPreset("original")
		setDims({ w: 0, h: 0, natW: 0, natH: 0 })

		try {
			const img = await loadImg(`/assets/${name}`)
			setDims({
				w: img.naturalWidth,
				h: img.naturalHeight,
				natW: img.naturalWidth,
				natH: img.naturalHeight,
			})
		} catch (e) {
			console.error("Failed to load image for dimensions", e)
		}
	}

	const closeModal = () => {
		setSelectedMeme(null)
	}

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
		if (!selectedMeme) return null
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
		if (!selectedMeme) return
		setIsRendering(true)

		try {
			if (fmt === "gif") {
				triggerDownload(`/assets/${selectedMeme}`, selectedMeme)
			} else {
				const canvas = await renderCanvas()
				if (!canvas) return
				const mime = {
					png: "image/png",
					jpg: "image/jpeg",
					webp: "image/webp",
				}[fmt]
				const q =
					fmt === "jpg" || fmt === "webp" ? quality / 100 : undefined

				canvas.toBlob(
					blob => {
						if (!blob) {
							setIsRendering(false)
							return
						}
						const url = URL.createObjectURL(blob)
						const ext = fmt
						triggerDownload(
							url,
							selectedMeme.replace(/\.[^.]+$/, "") + "." + ext,
						)
						setTimeout(() => URL.revokeObjectURL(url), 3000)
						setIsRendering(false)
					},
					mime,
					q,
				)
				return
			}
		} catch (e) {
			console.error(e)
		}
		setIsRendering(false)
	}

	const handleCopy = async () => {
		if (!selectedMeme || fmt === "gif") return
		setIsRendering(true)

		try {
			const canvas = await renderCanvas()
			if (!canvas) return
			canvas.toBlob(async blob => {
				if (!blob) {
					setIsRendering(false)
					return
				}
				try {
					await navigator.clipboard.write([
						new ClipboardItem({ "image/png": blob }),
					])
				} catch (e) {
					console.error("Failed to copy blob", e)
					await navigator.clipboard.writeText(
						`${window.location.origin}/assets/${selectedMeme}`,
					)
				}
				setIsRendering(false)
			}, "image/png")
		} catch (e) {
			console.error(e)
			setIsRendering(false)
		}
	}

	return (
		<div className="min-h-screen">
			<Header
				search={search}
				onSearchChange={setSearch}
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
				<ExportModal
					selectedMeme={selectedMeme}
					onClose={closeModal}
					fmt={fmt}
					setFmt={setFmt}
					quality={quality}
					setQuality={setQuality}
					preset={preset}
					setPreset={setPreset}
					dims={exportDims}
					estSize={estSize}
					isRendering={isRendering}
					onDownload={handleDownload}
					onCopy={handleCopy}
				/>
			)}
		</div>
	)
}
