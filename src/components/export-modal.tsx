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
import type { Dims, MemeFormat, SizePreset } from "@/types"

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
	const isGif = isGifFile(selectedMeme)

	return (
		<Dialog open onOpenChange={open => !open && onClose()}>
			<DialogContent variant="meme" className="gap-0 p-0" showCloseButton>
				<ExportPreview
					selectedMeme={selectedMeme}
					dims={dims}
					isAnimated={isGif}
				/>

				<div className="flex flex-col overflow-auto p-7 pt-7 pb-6 md:max-h-[92vh]">
					<DialogHeader className="mb-5 gap-1">
						<DialogTitle className="font-heading text-[28px] leading-tight tracking-tight text-meme-ink">
							Export
						</DialogTitle>
					</DialogHeader>

					<ExportOptions
						fmt={fmt}
						setFmt={setFmt}
						quality={quality}
						setQuality={setQuality}
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
						estSize={estSize}
						isDownloading={isDownloading}
						onDownload={onDownload}
					/>
				</div>
			</DialogContent>
		</Dialog>
	)
}
