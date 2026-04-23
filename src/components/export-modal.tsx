import { Download } from "lucide-react"
import { badgeVariants } from "@/components/ui/badge"
import {
	Dialog,
	DialogContent,
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
	isDownloading: boolean
	onDownload: () => void
	onTagClick: (tag: string) => void
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
	isDownloading,
	onDownload,
	onTagClick,
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
											"meme-pressable [--meme-shadow-active:2px_2px_0_var(--color-meme-ink)] flex flex-col items-center rounded-xl border-2 border-meme-ink bg-meme-paper py-3.5 px-1.5",
											fmt === f
												? "[--meme-shadow-rest:3px_3px_0_var(--color-meme-ink)] [--meme-shadow-hover:5px_5px_0_var(--color-meme-ink)] bg-meme-accent text-white"
												: "[--meme-shadow-rest:0_0_0_transparent] [--meme-shadow-hover:3px_4px_0_var(--color-meme-ink)]",
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
											"meme-pressable [--meme-shadow-active:2px_2px_0_var(--color-meme-ink)] rounded-full border-2 border-meme-ink px-3.5 py-1.5 font-mono text-[11px] font-semibold tracking-wider",
											preset === p
												? "[--meme-shadow-rest:3px_3px_0_var(--color-meme-ink)] [--meme-shadow-hover:5px_5px_0_var(--color-meme-ink)] bg-meme-ink text-meme-bg"
												: "[--meme-shadow-rest:0_0_0_transparent] [--meme-shadow-hover:3px_3px_0_var(--color-meme-ink)] bg-meme-paper",
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
									<button
										key={tag}
										type="button"
										onClick={() => {
											onTagClick(tag)
										}}
										className={cn(
											badgeVariants({ variant: "outline" }),
											"meme-pressable [--meme-shadow-rest:2px_2px_0_var(--color-meme-ink)] [--meme-shadow-hover:4px_4px_0_var(--color-meme-ink)] [--meme-shadow-active:1px_1px_0_var(--color-meme-ink)] cursor-pointer border-2 border-meme-ink bg-meme-paper px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wide text-meme-ink hover:bg-meme-accent2 hover:text-meme-ink",
										)}
									>
										#{tag}
									</button>
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
								"mt-3.5",
							)}
						>
							<button
								onClick={onDownload}
								disabled={isDownloading}
								className="meme-pressable [--meme-shadow-rest:4px_5px_0_var(--color-meme-ink)] [--meme-shadow-hover:6px_8px_0_var(--color-meme-ink)] flex w-full items-center justify-center gap-2 rounded-2xl border-[2.5px] border-meme-ink bg-meme-accent py-3.5 px-4 font-heading text-sm text-white disabled:opacity-40"
							>
								<Download size={16} />{" "}
								{isDownloading ? "Rendering..." : "Download"}
							</button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
