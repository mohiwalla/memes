import { Download, Copy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { Dims, MemeFormat, SizePreset } from "@/types"
import { getExt, getTagsForMeme, makeTitle } from "@/lib/utils"

export type ExportModalProps = {
	selectedMeme: string
	onClose: () => void
	fmt: MemeFormat
	setFmt: (f: MemeFormat) => void
	quality: number
	setQuality: (q: number) => void
	preset: SizePreset
	setPreset: (p: SizePreset) => void
	dims: Dims
	estSize: string
	isRendering: boolean
	onDownload: () => void
	onCopy: () => void
}

export function ExportModal({
	selectedMeme,
	onClose,
	fmt,
	setFmt,
	quality,
	setQuality,
	preset,
	setPreset,
	dims,
	estSize,
	isRendering,
	onDownload,
	onCopy,
}: ExportModalProps) {
	const isGifFile = selectedMeme.toLowerCase().endsWith(".gif")
	const tags = getTagsForMeme(selectedMeme)

	return (
		<Dialog open onOpenChange={open => !open && onClose()}>
			<DialogContent variant="meme" className="gap-0 p-0" showCloseButton>
				<div className="flex flex-col gap-4 overflow-auto border-meme-ink bg-meme-bg-2 p-8 md:max-h-[92vh] md:border-r-2 md:border-dashed">
					<div className="grid min-h-[280px] flex-1 place-items-center">
						<div className="max-w-full rounded-2xl border-2 border-meme-ink bg-[linear-gradient(45deg,#0001_25%,transparent_25%),linear-gradient(-45deg,#0001_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#0001_75%),linear-gradient(-45deg,transparent_75%,#0001_75%)] p-3.5 shadow-[4px_4px_0_var(--color-meme-ink)]">
							<img
								src={`/assets/${selectedMeme}`}
								alt={makeTitle(selectedMeme)}
								className="block max-h-[55vh] max-w-full rounded-md"
							/>
						</div>
					</div>
					<div className="rounded-2xl border-2 border-meme-ink bg-meme-paper p-3.5 px-4.5 shadow-[3px_3px_0_var(--color-meme-ink)]">
						<div className="truncate font-heading text-lg tracking-tight">
							{makeTitle(selectedMeme)}
						</div>
						<div className="mt-1 font-mono text-[11px] tracking-widest text-meme-ink-2 uppercase">
							{dims.natW || "—"} x {dims.natH || "—"} PX ·{" "}
							{getExt(selectedMeme)} {isGifFile && "· ANIMATED"}
						</div>
					</div>
				</div>

				<div className="flex flex-col overflow-auto p-7 pt-7 pb-6 md:max-h-[92vh]">
					<DialogHeader className="mb-5 gap-1">
						<DialogTitle className="font-heading text-[28px] leading-tight tracking-tight text-meme-ink">
							Export
						</DialogTitle>
						<DialogDescription className="text-[13px] text-meme-ink-2">
							{isGifFile
								? "GIF stays original. Animation stays intact."
								: "Pick format, resize, ship."}
						</DialogDescription>
					</DialogHeader>

					{!isGifFile && (
						<div className="mb-5">
							<div className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[.14em] text-meme-ink-2">
								Format
							</div>
							<div className="grid grid-cols-3 gap-2">
								{(["png", "jpg", "webp"] as const).map(f => (
									<button
										key={f}
										onClick={() => setFmt(f)}
										className={cn(
											"flex flex-col items-center rounded-xl border-2 border-meme-ink bg-meme-paper py-3.5 px-1.5 transition-all",
											fmt === f
												? "bg-meme-accent text-white shadow-[3px_3px_0_var(--color-meme-ink)]"
												: "hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[3px_4px_0_var(--color-meme-ink)]",
										)}
									>
										<span className="text-sm font-bold tracking-tight uppercase">
											{f}
										</span>
										<span className="mt-0.5 font-mono text-[10px] opacity-70">
											{f === "png" && "lossless"}
											{f === "jpg" && "small"}
											{f === "webp" && "tiny"}
										</span>
									</button>
								))}
							</div>
						</div>
					)}

					{fmt !== "gif" && (
						<div className="mb-5">
							<div className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[.14em] text-meme-ink-2">
								Size
							</div>
							<div className="mb-2.5 flex flex-wrap gap-1.5">
								{(
									[
										"original",
										"sm",
										"md",
										"lg",
										"sq",
									] as const
								).map(p => (
									<button
										key={p}
										onClick={() => setPreset(p)}
										className={cn(
											"rounded-full border-2 border-meme-ink px-3.5 py-1.5 font-mono text-[11px] font-semibold tracking-wider transition-all hover:-translate-y-0.5",
											preset === p
												? "bg-meme-ink text-meme-bg"
												: "bg-meme-paper",
										)}
									>
										{p === "original"
											? "Original"
											: p === "sm"
												? "240"
												: p === "md"
													? "480"
													: p === "lg"
														? "800"
														: "512^2"}
									</button>
								))}
							</div>
							<div className="rounded-xl border-2 border-meme-ink bg-meme-bg-2 px-3.5 py-3 font-mono text-[12px] uppercase tracking-[.14em] text-meme-ink-2">
								{dims.w || "—"} x {dims.h || "—"} px
							</div>
						</div>
					)}

					{(fmt === "jpg" || fmt === "webp") && (
						<div className="mb-5">
							<div className="mb-2.5 flex justify-between font-mono text-[10px] font-semibold uppercase tracking-[.14em] text-meme-ink-2">
								<span>Quality</span>
								<span>{quality}%</span>
							</div>
							<input
								type="range"
								min="10"
								max="100"
								value={quality}
								onChange={e =>
									setQuality(parseInt(e.target.value))
								}
								className="h-2 w-full cursor-pointer appearance-none rounded-full border-2 border-meme-ink bg-meme-bg-2 accent-meme-accent"
							/>
						</div>
					)}

					<div className="mb-5">
						<div className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[.14em] text-meme-ink-2">
							Tags
						</div>
						{tags.length ? (
							<div className="flex flex-wrap gap-2">
								{tags.map(tag => (
									<Badge key={tag} variant="outline">
										{tag}
									</Badge>
								))}
							</div>
						) : (
							<p className="text-[13px] text-meme-ink-2">
								No tags yet.
							</p>
						)}
					</div>

					<div className="mt-auto">
						<div className="flex justify-between rounded-xl border-2 border-dashed border-meme-ink bg-meme-bg-2 p-2.5 px-3.5 font-mono text-[12px]">
							<span>est. size</span>
							<b className="text-[13px]">{estSize}</b>
						</div>

						<div
							className={cn(
								"mt-3.5 grid gap-2.5",
								isGifFile
									? "grid-cols-1"
									: "grid-cols-[1fr_2fr]",
							)}
						>
							{!isGifFile && (
								<button
									onClick={onCopy}
									disabled={isRendering}
									className="flex items-center justify-center gap-2 rounded-2xl border-[2.5px] border-meme-ink bg-meme-paper py-3.5 px-4 font-heading text-sm lowercase shadow-[3px_3px_0_var(--color-meme-ink)] transition-all hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-meme-accent2 hover:shadow-[5px_5px_0_var(--color-meme-ink)] disabled:opacity-40"
								>
									<Copy size={16} /> copy
								</button>
							)}
							<button
								onClick={onDownload}
								disabled={isRendering}
								className="flex items-center justify-center gap-2 rounded-2xl border-[2.5px] border-meme-ink bg-meme-accent py-3.5 px-4 font-heading text-sm lowercase text-white shadow-[4px_5px_0_var(--color-meme-ink)] transition-all hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[6px_8px_0_var(--color-meme-ink)] disabled:opacity-40"
							>
								<Download size={16} />{" "}
								{isRendering ? "rendering..." : "download"}
							</button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
