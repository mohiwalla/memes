import { useEffect, useRef } from "react"
import { Search, X } from "lucide-react"

type HomeHeaderProps = {
	search: string
	onSearchChange: (q: string) => void
	filteredCount: number
}

export function Header({
	search,
	onSearchChange,
	filteredCount,
}: HomeHeaderProps) {
	const searchRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		const isEditableTarget = (target: EventTarget | null) => {
			if (!(target instanceof HTMLElement)) return false

			return (
				target.isContentEditable ||
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.tagName === "SELECT"
			)
		}

		const focusSearch = () => {
			searchRef.current?.focus()
			searchRef.current?.select()
		}

		const onKeyDown = (event: KeyboardEvent) => {
			if (
				(event.metaKey || event.ctrlKey) &&
				event.key.toLowerCase() === "f"
			) {
				event.preventDefault()
				focusSearch()
				return
			}

			if (
				event.key === "/" &&
				!event.metaKey &&
				!event.ctrlKey &&
				!event.altKey &&
				!isEditableTarget(event.target)
			) {
				event.preventDefault()
				focusSearch()
			}
		}

		window.addEventListener("keydown", onKeyDown)
		return () => window.removeEventListener("keydown", onKeyDown)
	}, [])

	return (
		<header className="relative z-10 px-6 pt-9 pb-4 sm:px-12">
			<div className="flex flex-wrap items-center justify-between gap-5">
				<div className="flex items-center gap-3.5 font-heading">
					<div className="relative h-13 w-13 shrink-0 -rotate-8 rounded-[50%_50%_50%_18%] border-3 border-meme-ink bg-meme-accent shadow-[5px_5px_0_var(--color-meme-ink)]">
						<div className="absolute top-4 left-3 h-3.25 w-2.25 rounded-full bg-meme-ink" />
						<div className="absolute top-4 right-3 h-3.25 w-2.25 rounded-full bg-meme-ink" />
					</div>
					<div className="text-[34px] leading-none tracking-tight">
						MEME
						<span className="text-meme-accent [-webkit-text-stroke:2px_var(--color-meme-ink)]">
							STASH
						</span>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2.5">
					<div className="relative flex items-center">
						<Search
							className="absolute left-3 h-3.75 w-3.75 text-meme-ink-2 pointer-events-none"
							strokeWidth={2.5}
						/>
						<input
							ref={searchRef}
							type="text"
							placeholder="search memes... (/ or Ctrl/Cmd+F)"
							aria-label="Search memes"
							value={search}
							onChange={e => onSearchChange(e.target.value)}
							className="w-[220px] sm:w-[310px] rounded-full border-[2.5px] border-meme-ink bg-meme-paper px-8.5 py-2.5 font-sans text-sm font-medium text-meme-ink outline-none shadow-[3px_3px_0_var(--color-meme-ink)] transition-all focus:border-meme-accent focus:shadow-[5px_5px_0_var(--color-meme-accent)] placeholder:text-meme-ink-2"
						/>
						{search && (
							<button
								onClick={() => onSearchChange("")}
								className="absolute right-2.5 p-1 text-meme-ink-2 hover:text-meme-ink"
							>
								<X size={14} strokeWidth={3} />
							</button>
						)}
					</div>
					<div className="rounded-full border-2 border-meme-ink bg-meme-ink px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-meme-bg shadow-[3px_3px_0_var(--color-meme-ink)]">
						{filteredCount} MEMES
					</div>
				</div>
			</div>

			<div className="mt-5 overflow-hidden whitespace-nowrap rounded-full border-2 border-meme-ink bg-meme-ink py-3 font-heading text-sm tracking-widest text-meme-accent2 shadow-[4px_4px_0_var(--color-meme-ink)] -rotate-1">
				<div className="inline-block animate-ribbon">
					<span>
						✦ MEME STASH ✦ CLICK TO EXPORT ✦ SCROLL FOR MORE ✦ MEME
						STASH ✦ CLICK TO EXPORT ✦ SCROLL FOR MORE ✦ MEME STASH ✦
						CLICK TO EXPORT ✦ SCROLL FOR MORE ✦ MEME STASH ✦ CLICK
						TO EXPORT ✦ SCROLL FOR MORE ✦
					</span>
					<span>
						✦ MEME STASH ✦ CLICK TO EXPORT ✦ SCROLL FOR MORE ✦ MEME
						STASH ✦ CLICK TO EXPORT ✦ SCROLL FOR MORE ✦ MEME STASH ✦
						CLICK TO EXPORT ✦ SCROLL FOR MORE ✦ MEME STASH ✦ CLICK
						TO EXPORT ✦ SCROLL FOR MORE ✦
					</span>
				</div>
			</div>
		</header>
	)
}
