type HomeFooterProps = {
	memeCount: number
}

export function Footer({ memeCount }: HomeFooterProps) {
	return (
		<footer className="meme-footer relative z-0 flex flex-wrap items-center justify-between gap-3 border-t-2 border-dashed border-meme-ink text-meme-ink-2">
			<div className="font-mono tracking-wide">
				Made with ❤️ by{" "}
				<a
					href="https://github.com/mohiwalla"
					target="_blank"
					rel="noopener noreferrer"
					className="underline underline-offset-4"
				>
					mohiwalla
				</a>
			</div>

			<div className="font-mono tracking-widest uppercase text-sm">
				{memeCount} search results
			</div>
		</footer>
	)
}
