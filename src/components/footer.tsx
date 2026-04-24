type HomeFooterProps = {
	memeCount: number
}

export function Footer({ memeCount }: HomeFooterProps) {
	return (
		<footer className="relative z-0 mx-4 flex flex-wrap items-center justify-between gap-3 border-t-2 border-dashed border-meme-ink pt-6 pb-9 text-meme-ink-2 min-[480px]:mx-6 sm:mx-12 max-md:flex-col max-md:items-start max-md:gap-2">
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
