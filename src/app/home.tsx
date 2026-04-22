import { useEffect, useState, useMemo } from "react"
import { ExportModal } from "../components/export-modal"
import { Footer } from "../components/footer"
import { Header } from "../components/header"
import { GridUI } from "../components/grid-ui"
import { loadImg, triggerDownload, searchMemes } from "@/lib/utils"
import type { Dims, MemeFormat, SizePreset } from "@/types"

export default function HomePage() {
	const [images, setImages] = useState<string[]>([])
	const [search, setSearch] = useState("")
	const [selectedMeme, setSelectedMeme] = useState<string | null>(null)

	const [fmt, setFmt] = useState<MemeFormat>("png")
	const [bg, setBg] = useState("transparent")
	const [quality, setQuality] = useState(92)
	const [preset, setPreset] = useState<SizePreset>("original")
	const [lockRatio, setLockRatio] = useState(true)
	const [dims, setDims] = useState<Dims>({ w: 0, h: 0, natW: 0, natH: 0 })
	const [estSize, setEstSize] = useState("—")
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
		setSelectedMeme(name)
		setFmt("png")
		setBg("transparent")
		setQuality(92)
		setPreset("original")
		setLockRatio(true)
		setDims({ w: 0, h: 0, natW: 0, natH: 0 })
		setEstSize("—")

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

	useEffect(() => {
		if (preset === "custom") return
		const { natW, natH } = dims
		if (!natW || !natH) return

		const aspect = natW / natH
		let w = natW
		let h = natH

		if (preset === "sm") {
			w = 240
			h = Math.round(240 / aspect)
		} else if (preset === "md") {
			w = 480
			h = Math.round(480 / aspect)
		} else if (preset === "lg") {
			w = 800
			h = Math.round(800 / aspect)
		} else if (preset === "sq") {
			w = 512
			h = 512
		}

		setDims(prev => ({ ...prev, w, h }))
	}, [preset, dims.natW, dims.natH])

	useEffect(() => {
		const { w, h } = dims
		if (!w || !h || fmt === "gif") {
			setEstSize(fmt === "gif" ? "original" : "—")
			return
		}

		const px = w * h
		const q = quality / 100
		let kb = 0

		if (fmt === "jpg") kb = Math.round((px * q * 0.18) / 1024)
		else if (fmt === "webp") kb = Math.round((px * q * 0.12) / 1024)
		else if (fmt === "png") kb = Math.round((px * 0.7) / 1024)

		setEstSize(kb < 1024 ? `${kb} KB` : `${(kb / 1024).toFixed(1)} MB`)
	}, [dims.w, dims.h, fmt, quality])

	const renderCanvas = async () => {
		if (!selectedMeme) return null
		const img = await loadImg(`/assets/${selectedMeme}`)
		const { w, h } = dims
		const canvas = document.createElement("canvas")
		canvas.width = w
		canvas.height = h
		const ctx = canvas.getContext("2d")
		if (!ctx) return null

		let fill: string | null = null
		if (fmt === "jpg") {
			fill = bg === "transparent" ? "#ffffff" : bg
		} else if (bg !== "transparent") {
			fill = bg
		}
		if (fill) {
			ctx.fillStyle = fill
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
						if (!blob) return
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
				if (!blob) return
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
					bg={bg}
					setBg={setBg}
					quality={quality}
					setQuality={setQuality}
					preset={preset}
					setPreset={setPreset}
					lockRatio={lockRatio}
					setLockRatio={setLockRatio}
					dims={dims}
					setDims={setDims}
					estSize={estSize}
					isRendering={isRendering}
					onDownload={handleDownload}
					onCopy={handleCopy}
				/>
			)}
		</div>
	)
}
