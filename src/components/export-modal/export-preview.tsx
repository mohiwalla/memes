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
		<div className="flex flex-col gap-3 overflow-auto border-meme-ink bg-meme-bg-2 p-3 md:gap-4 md:p-8 md:max-h-[92vh] md:border-r-2 md:border-dashed">
			<div className="grid min-h-[120px] flex-1 place-items-center md:min-h-[280px]">
				<div className="max-w-full rounded-2xl border-2 border-meme-ink bg-[linear-gradient(45deg,#0001_25%,transparent_25%),linear-gradient(-45deg,#0001_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#0001_75%),linear-gradient(-45deg,transparent_75%,#0001_75%)] p-2 shadow-[4px_4px_0_var(--color-meme-ink)] md:p-3.5">
					<img
						src={assetUrl}
						alt={makeTitle(selectedMeme)}
						className="block max-h-[20vh] max-w-full rounded-md md:max-h-[55vh]"
					/>
				</div>
			</div>
			<div className="rounded-2xl border-2 border-meme-ink bg-meme-paper p-2 px-2.5 shadow-[3px_3px_0_var(--color-meme-ink)] md:p-3.5 md:px-4.5">
				<div className="truncate font-heading text-sm tracking-tight md:text-lg">
					{makeTitle(selectedMeme)}
				</div>
				<div className="mt-1 font-mono text-[10px] tracking-widest text-meme-ink-2 uppercase md:text-[11px]">
					{dims.natW || "—"} x {dims.natH || "—"} PX ·{" "}
					{getExt(selectedMeme)} {isAnimated && "· ANIMATED"}
				</div>
			</div>
		</div>
	)
}
