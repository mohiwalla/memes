import { useRef } from "react"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { ExportDownloadPanel } from "@/components/export-modal/export-download-panel"
import { ExportOptions } from "@/components/export-modal/export-options"
import { ExportPreview } from "@/components/export-modal/export-preview"
import { ExportTags } from "@/components/export-modal/export-tags"
import { isGifFile } from "@/lib/meme-export"
import type { Dims, DownloadOrigin, MemeFormat, SizePreset } from "@/types"

export type ExportModalProps = {
	selectedMeme: string
	onClose: () => void
	fmt: MemeFormat
	setFmt: (f: MemeFormat) => void
	preset: SizePreset
	setPreset: (p: SizePreset) => void
	dims: Dims
	estSize: string
	isDownloading: boolean
	downloadStatus: "idle" | "rendering" | "success"
	onDownload: (origin: DownloadOrigin) => void
	onTagClick: (tag: string) => void
}

export function ExportModal({
	selectedMeme,
	onClose,
	fmt,
	setFmt,
	preset,
	setPreset,
	dims,
	estSize,
	isDownloading,
	downloadStatus,
	onDownload,
	onTagClick,
}: ExportModalProps) {
	const isGif = isGifFile(selectedMeme)
	const downloadButtonRef = useRef<HTMLButtonElement>(null)

	return (
		<Dialog open onOpenChange={open => !open && onClose()}>
			<DialogContent
				variant="meme"
				className="gap-0 p-0"
				showCloseButton
				initialFocus={downloadButtonRef}
			>
				<ExportPreview
					selectedMeme={selectedMeme}
					dims={dims}
					isAnimated={isGif}
				/>

				<div className="flex flex-col overflow-auto p-3 pt-3 pb-4 md:p-7 md:pt-7 md:pb-6">
					<DialogHeader className="mb-3 gap-1 md:mb-5">
						<DialogTitle className="font-heading text-lg leading-tight tracking-tight text-meme-ink md:text-[28px]">
							Export
						</DialogTitle>
					</DialogHeader>

					<ExportOptions
						fmt={fmt}
						setFmt={setFmt}
						preset={preset}
						setPreset={setPreset}
						dims={dims}
						isGifFile={isGif}
					/>

					<ExportTags
						selectedMeme={selectedMeme}
						onTagClick={onTagClick}
					/>

					<ExportDownloadPanel
						downloadButtonRef={downloadButtonRef}
						estSize={estSize}
						isDownloading={isDownloading}
						downloadStatus={downloadStatus}
						onDownload={onDownload}
					/>
				</div>
			</DialogContent>
		</Dialog>
	)
}
