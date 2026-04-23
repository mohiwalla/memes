import { getAssetUrl, getExt, makeTitle } from "@/lib/utils"
import type { Dims } from "@/types"

type ExportPreviewProps = {
	selectedMeme: string
	dims: Dims
	isAnimated: boolean
}

export function ExportPreview({
	selectedMeme,
	dims,
	isAnimated,
}: ExportPreviewProps) {
	const assetUrl = getAssetUrl(selectedMeme)

	return (
		<div className="meme-export-preview flex flex-col gap-4 overflow-auto border-meme-ink bg-meme-bg-2 p-8 md:max-h-[92vh] md:border-r-2 md:border-dashed">
			<div className="meme-export-preview-stage grid min-h-70 flex-1 place-items-center">
				<div className="meme-transparent-grid max-w-full rounded-md border-2 border-meme-ink p-3.5 shadow-[4px_4px_0_var(--color-meme-ink)]">
					<img
						src={assetUrl}
						alt={makeTitle(selectedMeme)}
						className="meme-export-preview-image block"
					/>
				</div>
			</div>
			<div className="rounded-2xl border-2 border-meme-ink bg-meme-paper p-3.5 px-4.5 shadow-[3px_3px_0_var(--color-meme-ink)]">
				<div className="truncate font-heading text-lg tracking-tight">
					{makeTitle(selectedMeme)}
				</div>
				<div className="mt-1 font-mono text-[11px] tracking-widest text-meme-ink-2 uppercase">
					{dims.natW || "—"} x {dims.natH || "—"} PX ·{" "}
					{getExt(selectedMeme)} {isAnimated && "· ANIMATED"}
				</div>
			</div>
		</div>
	)
}
