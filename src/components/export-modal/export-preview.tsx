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
		<div className="flex flex-col gap-3 overflow-visible border-meme-ink bg-meme-bg-2 p-4 pb-3 md:max-h-[92vh] md:gap-4 md:overflow-auto md:border-r-2 md:border-dashed md:p-8">
			<div className="grid min-h-40 flex-1 place-items-center md:min-h-70">
				<div className="meme-transparent-grid max-w-full rounded-md border-2 border-meme-ink p-3.5 shadow-[4px_4px_0_var(--color-meme-ink)]">
					<img
						src={assetUrl}
						alt={makeTitle(selectedMeme)}
						className="block max-h-[24vh] max-w-full md:max-h-[55vh]"
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
