type HomeFooterProps = {
	memeCount: number
}

export function Footer({ memeCount }: HomeFooterProps) {
	return (
		<footer className="relative z-0 mx-6 border-t-2 border-dashed border-meme-ink px-12 pt-6 pb-9 sm:mx-12 flex flex-wrap justify-between items-center gap-3 text-meme-ink-2">
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
