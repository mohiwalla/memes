import { MemeTile } from "./meme-tile"

type MemeGridProps = {
	cols: number
	items: string[]
	search: string
	onOpenMeme: (name: string) => void
}

export function GridUI({ cols, items, search, onOpenMeme }: MemeGridProps) {
	return (
		<main className="relative z-0 px-6 pt-8 pb-20 sm:px-12">
			<div
				className="grid gap-5.5 transition-all"
				style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
			>
				{items.map(name => (
					<MemeTile
						key={name}
						name={name}
						onClick={() => onOpenMeme(name)}
					/>
				))}
			</div>

			{items.length === 0 && (
				<div className="py-20 text-center text-meme-ink-2">
					<div className="mb-3 text-5xl">🔍</div>
					<p className="text-base">
						no memes match <b>"{search}"</b>
					</p>
				</div>
			)}
		</main>
	)
}
