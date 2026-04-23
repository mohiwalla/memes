type HomeFooterProps = {
	memeCount: number
}

export function Footer({ memeCount }: HomeFooterProps) {
	return (
		<footer className="relative z-0 mx-4 border-t-2 border-dashed border-meme-ink px-4 pt-5 pb-7 sm:mx-6 sm:px-6 sm:pt-6 sm:pb-9 md:px-12 flex flex-wrap justify-center gap-2 text-[10px] text-meme-ink-2 sm:justify-between sm:gap-3 sm:text-xs">
			<div className="font-mono tracking-widest uppercase">
				MEME STASH v2.0
			</div>
			<div className="font-mono tracking-widest uppercase">
				{memeCount} MEMES
			</div>
		</footer>
	)
}
