import { Download } from "lucide-react"
import { cn } from "@/lib/utils"

type ExportDownloadPanelProps = {
	estSize: string
	isDownloading: boolean
	onDownload: () => void
}

export function ExportDownloadPanel({
	estSize,
	isDownloading,
	onDownload,
}: ExportDownloadPanelProps) {
	return (
		<div className="mt-auto">
			<div className="flex justify-between rounded-xl border-2 border-dashed border-meme-ink bg-meme-bg-2 p-2.5 px-3.5 font-mono text-[12px]">
				<span>est. size</span>
				<b className="text-[13px]">{estSize}</b>
			</div>

			<div className={cn("mt-3.5")}>
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
	)
}
