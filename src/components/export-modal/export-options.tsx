import { cn } from "@/lib/utils"
import type { Dims, MemeFormat, SizePreset } from "@/types"

type ExportOptionsProps = {
	fmt: MemeFormat
	setFmt: (f: MemeFormat) => void
	quality: number
	setQuality: (q: number) => void
	preset: SizePreset
	setPreset: (p: SizePreset) => void
	dims: Dims
	isGifFile: boolean
}

const FORMAT_OPTIONS = [
	{ value: "png", label: "lossless" },
	{ value: "jpg", label: "small" },
	{ value: "webp", label: "tiny" },
] as const

const SIZE_OPTIONS = [
	{ value: "original", label: "Original" },
	{ value: "sm", label: "240" },
	{ value: "md", label: "480" },
	{ value: "lg", label: "800" },
	{ value: "sq", label: "512^2" },
] as const

function SectionLabel({ children }: { children: string }) {
	return (
		<div className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[.14em] text-meme-ink-2">
			{children}
		</div>
	)
}

function FormatSelector({
	fmt,
	setFmt,
}: Pick<ExportOptionsProps, "fmt" | "setFmt">) {
	return (
		<div className="mb-5">
			<SectionLabel>Format</SectionLabel>
			<div className="grid grid-cols-3 gap-2">
				{FORMAT_OPTIONS.map(({ value, label }) => (
					<button
						key={value}
						onClick={() => setFmt(value)}
						className={cn(
							"meme-pressable [--meme-shadow-active:2px_2px_0_var(--color-meme-ink)] flex flex-col items-center rounded-xl border-2 border-meme-ink bg-meme-paper py-3.5 px-1.5",
							fmt === value
								? "[--meme-shadow-rest:3px_3px_0_var(--color-meme-ink)] [--meme-shadow-hover:5px_5px_0_var(--color-meme-ink)] bg-meme-accent text-white"
								: "[--meme-shadow-rest:0_0_0_transparent] [--meme-shadow-hover:3px_4px_0_var(--color-meme-ink)]",
						)}
					>
						<span className="text-sm font-bold tracking-tight uppercase">
							{value}
						</span>
						<span className="mt-0.5 font-mono text-[10px] opacity-70">
							{label}
						</span>
					</button>
				))}
			</div>
		</div>
	)
}

function SizeSelector({
	preset,
	setPreset,
	dims,
}: Pick<ExportOptionsProps, "preset" | "setPreset" | "dims">) {
	return (
		<div className="mb-5">
			<SectionLabel>Size</SectionLabel>
			<div className="mb-2.5 flex flex-wrap gap-1.5">
				{SIZE_OPTIONS.map(({ value, label }) => (
					<button
						key={value}
						type="button"
						onClick={() => setPreset(value)}
						className={cn(
							"meme-pressable [--meme-shadow-active:2px_2px_0_var(--color-meme-ink)] rounded-full border-2 border-meme-ink px-3.5 py-1.5 font-mono text-[11px] font-semibold tracking-wider",
							preset === value
								? "[--meme-shadow-rest:3px_3px_0_var(--color-meme-ink)] [--meme-shadow-hover:5px_5px_0_var(--color-meme-ink)] bg-meme-accent2 text-meme-ink"
								: "[--meme-shadow-rest:0_0_0_transparent] [--meme-shadow-hover:3px_3px_0_var(--color-meme-ink)] bg-meme-paper hover:bg-meme-accent2 hover:text-meme-ink",
						)}
					>
						{label}
					</button>
				))}
			</div>
			<div className="rounded-xl border-2 border-meme-ink bg-meme-bg-2 px-3.5 py-3 font-mono text-[12px] uppercase tracking-[.14em] text-meme-ink-2">
				{dims.w || "—"} x {dims.h || "—"} px
			</div>
		</div>
	)
}

function QualitySlider({
	quality,
	setQuality,
}: Pick<ExportOptionsProps, "quality" | "setQuality">) {
	return (
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
				onChange={e => setQuality(parseInt(e.target.value, 10))}
				className="h-2 w-full cursor-pointer appearance-none rounded-full border-2 border-meme-ink bg-meme-bg-2 accent-meme-accent"
			/>
		</div>
	)
}

export function ExportOptions({
	fmt,
	setFmt,
	quality,
	setQuality,
	preset,
	setPreset,
	dims,
	isGifFile,
}: ExportOptionsProps) {
	return (
		<>
			{!isGifFile && <FormatSelector fmt={fmt} setFmt={setFmt} />}

			{fmt !== "gif" && (
				<SizeSelector
					preset={preset}
					setPreset={setPreset}
					dims={dims}
				/>
			)}

			{(fmt === "jpg" || fmt === "webp") && (
				<QualitySlider quality={quality} setQuality={setQuality} />
			)}
		</>
	)
}
