import { Hash } from "lucide-react"
import { badgeVariants } from "@/components/ui/badge"
import { cn, getTagsForMeme } from "@/lib/utils"

type ExportTagsProps = {
	selectedMeme: string
	onTagClick: (tag: string) => void
}

export function ExportTags({ selectedMeme, onTagClick }: ExportTagsProps) {
	const tags = getTagsForMeme(selectedMeme)

	return (
		<div className="mb-5">
			<div className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[.14em] text-meme-ink-2">
				Tags
			</div>
			{tags.length ? (
				<div className="flex flex-wrap gap-2">
					{tags.map(tag => (
						<button
							key={tag}
							type="button"
							onClick={() => {
								onTagClick(tag)
							}}
							className={cn(
								badgeVariants({
									variant: "outline",
								}),
								"meme-pressable [--meme-shadow-rest:2px_2px_0_var(--color-meme-ink)] [--meme-shadow-hover:4px_4px_0_var(--color-meme-ink)] [--meme-shadow-active:1px_1px_0_var(--color-meme-ink)] cursor-pointer gap-1 border-2 border-meme-ink bg-meme-paper px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wide text-meme-ink hover:bg-meme-accent2 hover:text-meme-ink",
							)}
						>
							<Hash
								data-icon="inline-start"
								aria-hidden="true"
								className="text-meme-accent"
							/>
							<span>{tag}</span>
						</button>
					))}
				</div>
			) : (
				<p className="text-[13px] text-meme-ink-2">No tags yet.</p>
			)}
		</div>
	)
}
