import { useEffect, useEffectEvent, useRef } from "react"
import { Search, X } from "lucide-react"

type HomeHeaderProps = {
	search: string
	onSearchChange: (q: string) => void
	filteredCount: number
}

const getIsApplePlatform = () => {
	if (typeof navigator === "undefined") return false

	const browserNavigator = navigator as Navigator & {
		userAgentData?: { platform?: string }
	}
	const platform =
		browserNavigator.userAgentData?.platform ?? navigator.platform ?? ""

	return /mac|iphone|ipad|ipod/i.test(platform)
}

export function Header({
	search,
	onSearchChange,
	filteredCount,
}: HomeHeaderProps) {
	const searchRef = useRef<HTMLInputElement>(null)
	const isApplePlatform = getIsApplePlatform()
	const shortcutLabel = isApplePlatform ? "⌘K" : "Ctrl+K"
	const focusSearch = useEffectEvent(() => {
		searchRef.current?.focus()
		searchRef.current?.select()
	})
	const clearOrBlurSearch = useEffectEvent(() => {
		if (search) {
			onSearchChange("")
			return
		}

		searchRef.current?.blur()
	})

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			const usesSearchShortcut = isApplePlatform
				? event.metaKey && !event.ctrlKey
				: event.ctrlKey && !event.metaKey

			if (
				event.key === "Escape" &&
				document.activeElement === searchRef.current
			) {
				clearOrBlurSearch()
				return
			}

			if (
				usesSearchShortcut &&
				!event.altKey &&
				!event.shiftKey &&
				event.key.toLowerCase() === "k"
			) {
				event.preventDefault()
				focusSearch()
			}
		}

		window.addEventListener("keydown", onKeyDown)
		return () => window.removeEventListener("keydown", onKeyDown)
	}, [isApplePlatform])

	return (
		<header className="relative z-10 px-4 pt-6 pb-4 sm:px-6 sm:pt-9 md:px-12">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
				<div className="flex items-center justify-center gap-2.5 font-heading sm:gap-3.5 sm:justify-start">
					<div className="relative h-10 w-10 shrink-0 -rotate-8 rounded-[50%_50%_50%_18%] border-3 border-meme-ink bg-meme-accent shadow-[5px_5px_0_var(--color-meme-ink)] sm:h-13 sm:w-13">
						<div className="absolute top-3 left-2 h-2.5 w-1.75 rounded-full bg-meme-ink sm:top-4 sm:left-3 sm:h-3.25 sm:w-2.25" />
						<div className="absolute top-3 right-2 h-2.5 w-1.75 rounded-full bg-meme-ink sm:top-4 sm:right-3 sm:h-3.25 sm:w-2.25" />
					</div>
					<div className="text-[26px] leading-none tracking-tight sm:text-[34px]">
						MEME
						<span className="text-meme-accent [-webkit-text-stroke:1.5px_var(--color-meme-ink)] sm:[-webkit-text-stroke:2px_var(--color-meme-ink)]">
							STASH
						</span>
					</div>
				</div>

				<div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 sm:justify-end">
					<div className="relative flex items-center">
						<Search
							className="absolute left-2.5 h-3.5 w-3.5 text-meme-ink-2 pointer-events-none sm:left-3 sm:h-3.75 sm:w-3.75"
							strokeWidth={2.5}
						/>
						<input
							ref={searchRef}
							type="text"
							placeholder={`search... (${shortcutLabel})`}
							aria-label="Search memes"
							value={search}
							onChange={e => onSearchChange(e.target.value)}
							className="w-full max-w-[180px] rounded-full border-[2.5px] border-meme-ink bg-meme-paper px-7 py-2 font-sans text-sm font-medium text-meme-ink outline-none shadow-[3px_3px_0_var(--color-meme-ink)] transition-all focus:border-meme-accent focus:shadow-[5px_5px_0_var(--color-meme-accent)] placeholder:text-meme-ink-2 sm:max-w-[220px] sm:px-8.5 sm:py-2.5 sm:w-[310px]"
						/>
						{search && (
							<button
								onClick={() => onSearchChange("")}
								className="absolute right-2 p-1 text-meme-ink-2 hover:text-meme-ink sm:right-2.5"
							>
								<X size={14} strokeWidth={3} />
							</button>
						)}
					</div>
					<div className="rounded-full border-2 border-meme-ink bg-meme-ink px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-meme-bg shadow-[3px_3px_0_var(--color-meme-ink)] sm:px-4 sm:py-2 sm:text-[11px]">
						{filteredCount} MEMES
					</div>
				</div>
			</div>

			<div className="mt-4 overflow-hidden whitespace-nowrap rounded-full border-2 border-meme-ink bg-meme-ink py-2.5 font-heading text-xs tracking-widest text-meme-accent2 shadow-[4px_4px_0_var(--color-meme-ink)] -rotate-1 sm:mt-5 sm:py-3 sm:text-sm">
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
