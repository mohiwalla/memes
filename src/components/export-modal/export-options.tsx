import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip"
import { getExportDims } from "@/lib/meme-export"
import { cn } from "@/lib/utils"
import type { Dims, MemeFormat, SizePreset } from "@/types"

type ExportOptionsProps = {
	fmt: MemeFormat
	setFmt: (f: MemeFormat) => void
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
	{ value: "emoji", label: "Emoji" },
	{ value: "small", label: "Small" },
	{ value: "medium", label: "Medium" },
	{ value: "original", label: "Original" },
] as const

function SectionLabel({ children }: { children: string }) {
	return (
		<div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[.14em] text-meme-ink-2 md:mb-2.5">
			{children}
		</div>
	)
}

function FormatSelector({
	fmt,
	setFmt,
}: Pick<ExportOptionsProps, "fmt" | "setFmt">) {
	return (
		<div className="mb-4 md:mb-5">
			<SectionLabel>Format</SectionLabel>
			<div className="grid grid-cols-3 gap-2">
				{FORMAT_OPTIONS.map(({ value, label }) => (
					<button
						key={value}
						onClick={() => setFmt(value)}
						className={cn(
							"meme-pressable [--meme-shadow-active:2px_2px_0_var(--color-meme-ink)] flex flex-col items-center rounded-xl border-2 border-meme-ink bg-meme-paper py-2.5 px-1.5 md:py-3.5",
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
	const getTooltip = (value: SizePreset) => {
		const optionDims = getExportDims(value, dims)
		return `${optionDims.w || "—"} x ${optionDims.h || "—"} px`
	}

	return (
		<div className="mb-4 md:mb-5">
			<SectionLabel>Size</SectionLabel>
			<div className="flex flex-wrap gap-1.5">
				{SIZE_OPTIONS.map(({ value, label }) => (
					<Tooltip key={value}>
						<TooltipTrigger
							delay={20}
							render={
								<button
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
							}
						/>
						<TooltipContent>{getTooltip(value)}</TooltipContent>
					</Tooltip>
				))}
			</div>
		</div>
	)
}

export function ExportOptions({
	fmt,
	setFmt,
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
		</>
	)
}
