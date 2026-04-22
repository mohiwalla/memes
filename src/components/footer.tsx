type HomeFooterProps = {
	memeCount: number
}

export function Footer({ memeCount }: HomeFooterProps) {
	return (
		<footer className="relative z-0 mx-6 border-t-2 border-dashed border-meme-ink px-12 pt-6 pb-9 sm:mx-12 flex flex-wrap justify-between gap-3 text-xs text-meme-ink-2">
			<div className="font-mono tracking-widest uppercase">
				MEME STASH v2.0
			</div>
			<div className="font-mono tracking-widest uppercase">
				{memeCount} MEMES
			</div>
		</footer>
	)
}
