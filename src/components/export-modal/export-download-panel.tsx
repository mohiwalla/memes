import type { MouseEvent, RefObject } from "react"
import { Check, Download } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import type { DownloadOrigin } from "@/types"

type ExportDownloadPanelProps = {
	downloadButtonRef: RefObject<HTMLButtonElement | null>
	estSize: string
	isDownloading: boolean
	downloadStatus: "idle" | "rendering" | "success"
	onDownload: (origin: DownloadOrigin) => void
}

const clampOrigin = (value: number) => Math.min(Math.max(value, 0), 1)

const getDownloadOrigin = (
	event: MouseEvent<HTMLButtonElement>,
): DownloadOrigin => {
	const rect = event.currentTarget.getBoundingClientRect()
	const x = event.detail === 0 ? rect.left + rect.width / 2 : event.clientX
	const y = event.detail === 0 ? rect.top + rect.height / 2 : event.clientY

	return {
		x: clampOrigin(x / window.innerWidth),
		y: clampOrigin(y / window.innerHeight),
	}
}

export function ExportDownloadPanel({
	downloadButtonRef,
	estSize,
	isDownloading,
	downloadStatus,
	onDownload,
}: ExportDownloadPanelProps) {
	const isSuccess = downloadStatus === "success"
	const label = isDownloading
		? "Rendering..."
		: isSuccess
			? "Saved!"
			: "Download"

	return (
		<div className="mt-auto">
			<div className="flex justify-between rounded-xl border-2 border-dashed border-meme-ink bg-meme-bg-2 p-2.5 px-3.5 font-mono text-[12px]">
				<span>est. size</span>
				<b className="text-[13px]">{estSize}</b>
			</div>

			<div className={cn("mt-3.5 flex flex-col gap-2")}>
				<button
					ref={downloadButtonRef}
					onClick={event => onDownload(getDownloadOrigin(event))}
					disabled={isDownloading}
					aria-live="polite"
					data-status={downloadStatus}
					className={cn(
						"meme-pressable relative flex w-full items-center justify-center overflow-hidden rounded-2xl border-[2.5px] border-meme-ink px-4 py-3.5 font-heading text-sm",
						"[--meme-shadow-rest:4px_5px_0_var(--color-meme-ink)] [--meme-shadow-hover:6px_8px_0_var(--color-meme-ink)]",
						"bg-meme-accent text-white disabled:cursor-wait disabled:opacity-100",
						isDownloading &&
							"animate-download-working bg-meme-ink text-meme-bg",
						isSuccess &&
							"animate-download-pop bg-meme-accent2 text-meme-ink",
					)}
				>
					<span
						aria-hidden
						className={cn(
							"absolute inset-0 opacity-0",
							isDownloading &&
								"animate-shimmer bg-[linear-gradient(110deg,transparent_0%,transparent_38%,rgba(255,255,255,0.28)_48%,transparent_58%,transparent_100%)] bg-[length:200%_100%] opacity-100",
						)}
					/>
					<span className="relative flex items-center justify-center gap-2">
						{isDownloading ? (
							<Spinner data-icon="inline-start" />
						) : isSuccess ? (
							<Check data-icon="inline-start" />
						) : (
							<Download data-icon="inline-start" />
						)}
						{label}
					</span>
				</button>
				<p
					className={cn(
						"min-h-4 text-center font-mono text-[11px] text-meme-ink-2 transition-opacity",
						downloadStatus === "idle" && "opacity-0",
						downloadStatus !== "idle" && "opacity-100",
					)}
				>
					{isDownloading
						? "Building file..."
						: isSuccess
							? "Download started"
							: "\u00a0"}
				</p>
			</div>
		</div>
	)
}
