import type { Dispatch, SetStateAction } from "react"
import { X, Lock, Unlock, Download, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Dims, MemeFormat, SizePreset } from "@/types"
import { getExt, makeTitle } from "@/lib/utils"

export type ExportModalProps = {
	selectedMeme: string
	onClose: () => void
	fmt: MemeFormat
	setFmt: (f: MemeFormat) => void
	bg: string
	setBg: (b: string) => void
	quality: number
	setQuality: (q: number) => void
	preset: SizePreset
	setPreset: (p: SizePreset) => void
	lockRatio: boolean
	setLockRatio: (v: boolean) => void
	dims: Dims
	setDims: Dispatch<SetStateAction<Dims>>
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
	bg,
	setBg,
	quality,
	setQuality,
	preset,
	setPreset,
	lockRatio,
	setLockRatio,
	dims,
	setDims,
	estSize,
	isRendering,
	onDownload,
	onCopy,
}: ExportModalProps) {
	const isGifFile = selectedMeme.toLowerCase().endsWith(".gif")

	return (
		<div
			className="fixed inset-0 z-100 grid place-items-center bg-meme-ink/70 p-6 animate-in fade-in duration-200 backdrop-blur-sm"
			onClick={e => e.target === e.currentTarget && onClose()}
		>
			<div className="relative grid w-full max-w-[1060px] max-h-[92vh] grid-cols-1 overflow-hidden rounded-[28px] border-3 border-meme-ink bg-meme-paper shadow-[10px_10px_0_var(--color-meme-ink)] animate-in zoom-in-95 duration-220 md:grid-cols-[1.1fr_1fr]">
				<button
					onClick={onClose}
					className="absolute top-3.5 right-3.5 z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-meme-ink bg-meme-paper font-bold shadow-[3px_3px_0_var(--color-meme-ink)] transition-all hover:rotate-90 hover:bg-meme-accent hover:text-meme-paper"
				>
					<X size={18} strokeWidth={3} />
				</button>

				<div className="flex flex-col gap-4 overflow-auto border-meme-ink bg-meme-bg-2 p-8 md:max-h-[92vh] md:border-r-2 md:border-dashed">
					<div className="grid flex-1 place-items-center min-h-[280px]">
						<div className="max-w-full rounded-2xl border-2 border-meme-ink p-3.5 shadow-[4px_4px_0_var(--color-meme-ink)] [background-image:linear-gradient(45deg,#0001_25%,transparent_25%),linear-gradient(-45deg,#0001_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#0001_75%),linear-gradient(-45deg,transparent_75%,#0001_75%)]` can be written as `bg-[linear-gradient(45deg,#0001_25%,transparent_25%),linear-gradient(-45deg,#0001_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#0001_75%),linear-gradient(-45deg,transparent_75%,#0001_75%)]">
							<img
								src={`/assets/${selectedMeme}`}
								alt={makeTitle(selectedMeme)}
								className="block max-h-[55vh] max-w-full rounded-md"
							/>
						</div>
					</div>
					<div className="rounded-2xl border-2 border-meme-ink bg-meme-paper p-3.5 px-4.5 shadow-[3px_3px_0_var(--color-meme-ink)]">
						<div className="overflow-hidden text-ellipsis whitespace-nowrap font-heading text-lg tracking-tight">
							{makeTitle(selectedMeme)}
						</div>
						<div className="mt-1 font-mono text-[11px] tracking-widest text-meme-ink-2 uppercase">
							{dims.natW || "—"} × {dims.natH || "—"} PX ·{" "}
							{getExt(selectedMeme)} {isGifFile && "· ANIMATED"}
						</div>
					</div>
				</div>

				<div className="flex flex-col overflow-auto p-7 pt-7 pb-6 md:max-h-[92vh]">
					<div className="mb-5">
						<h2 className="font-heading text-[28px] leading-tight tracking-tight">
							Export
						</h2>
						<p className="mt-1 text-[13px] text-meme-ink-2">
							Pick a format, resize, and ship.
						</p>
					</div>

					<div className="mb-5">
						<div className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[.14em] text-meme-ink-2">
							Format
						</div>
						<div className="grid grid-cols-4 gap-2">
							{(["png", "jpg", "webp", "gif"] as const).map(f => {
								const disabled = f === "gif" && !isGifFile
								return (
									<button
										key={f}
										disabled={disabled}
										onClick={() => setFmt(f)}
										className={cn(
											"flex flex-col items-center rounded-xl border-2 border-meme-ink bg-meme-paper py-3.5 px-1.5 transition-all",
											fmt === f
												? "bg-meme-accent text-white shadow-[3px_3px_0_var(--color-meme-ink)]"
												: "hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[3px_4px_0_var(--color-meme-ink)]",
											disabled &&
												"opacity-40 cursor-not-allowed",
										)}
									>
										<span className="text-sm font-bold tracking-tight uppercase">
											{f}
										</span>
										<span className="mt-0.5 font-mono text-[10px] opacity-70">
											{f === "png" && "lossless"}
											{f === "jpg" && "small"}
											{f === "webp" && "tiny"}
											{f === "gif" &&
												(isGifFile ? "anim" : "n/a")}
										</span>
									</button>
								)
							})}
						</div>
						{isGifFile && fmt !== "gif" && (
							<div className="mt-2.5 rounded-xl border-2 border-meme-ink bg-meme-accent2 px-3 py-2 text-[12px] font-medium leading-tight">
								Exporting a still frame — pick GIF to keep
								animation.
							</div>
						)}
					</div>

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
														: "512²"}
									</button>
								))}
							</div>
							<div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2.5">
								<div className="flex flex-col gap-1">
									<span className="font-mono text-[10px] tracking-widest text-meme-ink-2 uppercase">
										W
									</span>
									<input
										type="number"
										value={dims.w || ""}
										onChange={e => {
											const v = Math.max(
												1,
												parseInt(e.target.value) || 0,
											)
											setPreset("custom")
											setDims(prev => ({
												...prev,
												w: v,
												h:
													lockRatio && prev.natW
														? Math.round(
																(v *
																	prev.natH) /
																	prev.natW,
															)
														: prev.h,
											}))
										}}
										className="w-full rounded-xl border-2 border-meme-ink bg-meme-paper p-2.5 font-mono text-sm font-semibold outline-none focus:bg-meme-accent2"
									/>
								</div>
								<button
									onClick={() => setLockRatio(!lockRatio)}
									className={cn(
										"flex h-10 w-10 items-center justify-center rounded-xl border-2 border-meme-ink transition-all",
										lockRatio
											? "bg-meme-accent2"
											: "bg-meme-paper",
									)}
								>
									{lockRatio ? (
										<Lock size={14} />
									) : (
										<Unlock size={14} />
									)}
								</button>
								<div className="flex flex-col gap-1">
									<span className="font-mono text-[10px] tracking-widest text-meme-ink-2 uppercase">
										H
									</span>
									<input
										type="number"
										value={dims.h || ""}
										onChange={e => {
											const v = Math.max(
												1,
												parseInt(e.target.value) || 0,
											)
											setPreset("custom")
											setDims(prev => ({
												...prev,
												h: v,
												w:
													lockRatio && prev.natH
														? Math.round(
																(v *
																	prev.natW) /
																	prev.natH,
															)
														: prev.w,
											}))
										}}
										className="w-full rounded-xl border-2 border-meme-ink bg-meme-paper p-2.5 font-mono text-sm font-semibold outline-none focus:bg-meme-accent2"
									/>
								</div>
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
								className="w-full h-2 cursor-pointer appearance-none rounded-full border-2 border-meme-ink bg-meme-bg-2 accent-meme-accent"
							/>
						</div>
					)}

					{(fmt === "png" || fmt === "webp") && (
						<div className="mb-5">
							<div className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[.14em] text-meme-ink-2">
								Background
							</div>
							<div className="flex flex-wrap gap-2">
								{[
									{
										label: "transparent",
										color: "transparent",
									},
									{ label: "white", color: "#ffffff" },
									{ label: "black", color: "#000000" },
									{ label: "yellow", color: "#FFD23F" },
									{ label: "pink", color: "#FF4FA3" },
									{ label: "blue", color: "#4CC9F0" },
								].map(s => (
									<button
										key={s.label}
										onClick={() => setBg(s.color)}
										title={s.label}
										style={{
											background:
												s.color === "transparent"
													? undefined
													: s.color,
										}}
										className={cn(
											"relative h-9 w-9 rounded-xl border-2 border-meme-ink bg-meme-bg-2 transition-all",
											bg === s.color
												? "scale-112 shadow-[3px_3px_0_var(--color-meme-ink)]"
												: "hover:scale-105",
										)}
									>
										{s.color === "transparent" && (
											<span className="grid place-items-center font-mono text-base text-meme-ink-2">
												∅
											</span>
										)}
									</button>
								))}
							</div>
						</div>
					)}

					<div className="mt-auto">
						<div className="flex justify-between rounded-xl border-2 border-dashed border-meme-ink bg-meme-bg-2 p-2.5 px-3.5 font-mono text-[12px]">
							<span>est. size</span>
							<b className="text-[13px]">{estSize}</b>
						</div>

						<div className="mt-3.5 grid grid-cols-[1fr_2fr] gap-2.5">
							<button
								onClick={onCopy}
								disabled={isRendering || fmt === "gif"}
								className="flex items-center justify-center gap-2 rounded-2xl border-[2.5px] border-meme-ink bg-meme-paper py-3.5 px-4 font-heading text-sm lowercase transition-all hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-meme-accent2 hover:shadow-[5px_5px_0_var(--color-meme-ink)] shadow-[3px_3px_0_var(--color-meme-ink)] disabled:opacity-40"
							>
								<Copy size={16} /> copy
							</button>
							<button
								onClick={onDownload}
								disabled={isRendering}
								className="flex items-center justify-center gap-2 rounded-2xl border-[2.5px] border-meme-ink bg-meme-accent py-3.5 px-4 font-heading text-sm text-white lowercase transition-all hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[6px_8px_0_var(--color-meme-ink)] shadow-[4px_5px_0_var(--color-meme-ink)] disabled:opacity-40"
							>
								<Download size={16} />{" "}
								{isRendering ? "rendering..." : "download"}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
