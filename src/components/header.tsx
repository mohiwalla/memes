import { useEffect, useEffectEvent, useRef, useState } from "react"
import { Github, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

const REPO_URL = "https://github.com/mohiwalla/memes"
const REPO_API_URL = "https://api.github.com/repos/mohiwalla/memes"
const REPO_STARS_CACHE_KEY = "meme-stash:repo-stars"
const REPO_STARS_CACHE_TTL_MS = 60 * 60 * 1000
const STAR_COUNT_FORMATTER = new Intl.NumberFormat("en-US", {
	notation: "compact",
	maximumFractionDigits: 1,
})

type HomeHeaderProps = {
	search: string
	onSearchChange: (q: string) => void
	filteredCount: number
	isSearchHotkeyEnabled?: boolean
}

const isEditableElement = (element: EventTarget | null) => {
	if (
		!(element instanceof HTMLInputElement) &&
		!(element instanceof HTMLTextAreaElement) &&
		!(element instanceof HTMLSelectElement) &&
		!(element instanceof HTMLElement)
	) {
		return false
	}

	if (element instanceof HTMLElement && element.isContentEditable) {
		return true
	}

	return (
		element instanceof HTMLInputElement ||
		element instanceof HTMLTextAreaElement ||
		element instanceof HTMLSelectElement
	)
}

const isPlainTypingKey = (event: KeyboardEvent) =>
	event.key.length === 1 &&
	!event.ctrlKey &&
	!event.metaKey &&
	!event.altKey

const getIsApplePlatform = () => {
	if (typeof navigator === "undefined") return false

	const browserNavigator = navigator as Navigator & {
		userAgentData?: { platform?: string }
	}
	const platform =
		browserNavigator.userAgentData?.platform ?? navigator.platform ?? ""

	return /mac|iphone|ipad|ipod/i.test(platform)
}

type RepoStarsCache = {
	stars: number
	fetchedAt: number
}

const readRepoStarsCache = (): RepoStarsCache | null => {
	if (typeof window === "undefined") return null

	try {
		const rawCache = window.localStorage.getItem(REPO_STARS_CACHE_KEY)
		if (!rawCache) return null

		const parsedCache = JSON.parse(rawCache) as Partial<RepoStarsCache>
		if (
			typeof parsedCache.stars !== "number" ||
			typeof parsedCache.fetchedAt !== "number"
		) {
			window.localStorage.removeItem(REPO_STARS_CACHE_KEY)
			return null
		}

		if (Date.now() - parsedCache.fetchedAt > REPO_STARS_CACHE_TTL_MS) {
			window.localStorage.removeItem(REPO_STARS_CACHE_KEY)
			return null
		}

		return {
			stars: parsedCache.stars,
			fetchedAt: parsedCache.fetchedAt,
		}
	} catch {
		window.localStorage.removeItem(REPO_STARS_CACHE_KEY)
		return null
	}
}

const writeRepoStarsCache = (stars: number) => {
	if (typeof window === "undefined") return

	window.localStorage.setItem(
		REPO_STARS_CACHE_KEY,
		JSON.stringify({
			stars,
			fetchedAt: Date.now(),
		} satisfies RepoStarsCache),
	)
}

export function Header({
	search,
	onSearchChange,
	filteredCount,
	isSearchHotkeyEnabled = true,
}: HomeHeaderProps) {
	const searchRef = useRef<HTMLInputElement>(null)
	const [repoStars, setRepoStars] = useState<number | null>(
		() => readRepoStarsCache()?.stars ?? null,
	)
	const isApplePlatform = getIsApplePlatform()
	const shortcutLabel = isApplePlatform ? "⌘K" : "Ctrl+K"
	const repoStarsLabel =
		repoStars === null
			? "..."
			: `${STAR_COUNT_FORMATTER.format(repoStars)} stars`
	const focusSearch = useEffectEvent(() => {
		searchRef.current?.focus()
		searchRef.current?.select()
	})
	const startSearchFromTyping = useEffectEvent((value: string) => {
		searchRef.current?.focus()
		onSearchChange(value)
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

			if (!isSearchHotkeyEnabled) return

			if (
				usesSearchShortcut &&
				!event.altKey &&
				!event.shiftKey &&
				event.key.toLowerCase() === "k"
			) {
				event.preventDefault()
				focusSearch()
				return
			}

			if (
				document.activeElement !== searchRef.current &&
				isPlainTypingKey(event) &&
				!isEditableElement(event.target)
			) {
				event.preventDefault()
				startSearchFromTyping(event.key)
			}
		}

		window.addEventListener("keydown", onKeyDown)
		return () => window.removeEventListener("keydown", onKeyDown)
	}, [isApplePlatform, isSearchHotkeyEnabled])

	useEffect(() => {
		const cachedRepoStars = readRepoStarsCache()
		if (cachedRepoStars) return

		const controller = new AbortController()

		void fetch(REPO_API_URL, {
			signal: controller.signal,
			headers: {
				Accept: "application/vnd.github+json",
			},
		})
			.then(response => {
				if (!response.ok) throw new Error("Failed to fetch repo stars")
				return response.json() as Promise<{ stargazers_count?: number }>
			})
			.then(data => {
				if (typeof data.stargazers_count === "number") {
					setRepoStars(data.stargazers_count)
					writeRepoStarsCache(data.stargazers_count)
				}
			})
			.catch(error => {
				if (
					error instanceof DOMException &&
					error.name === "AbortError"
				) {
					return
				}
			})

		return () => controller.abort()
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
						<div className="absolute left-3.5 flex items-center justify-center">
							<div className="relative flex items-center justify-center">
								<Search
									className="h-4 w-4 text-meme-ink-2"
									strokeWidth={2.5}
								/>
							</div>
						</div>

						<div className="absolute top-1/2 -mt-px -translate-1/2 -right-1 flex min-w-6 h-6 items-center justify-center rounded-full border-2 border-meme-ink bg-meme-accent px-1.5 font-sans text-[11px] font-bold text-meme-ink shadow-[2px_2px_0_var(--color-meme-ink)]">
							{filteredCount}
						</div>

						<input
							ref={searchRef}
							type="text"
							placeholder={`Search memes... (${shortcutLabel})`}
							aria-label="Search memes"
							value={search}
							onChange={e => onSearchChange(e.target.value)}
							className="w-55 sm:w-77.5 rounded-full border-[2.5px] border-meme-ink bg-meme-paper pl-9 pr-12 py-2.5 font-sans text-sm font-medium text-meme-ink outline-none shadow-[3px_3px_0_var(--color-meme-ink)] transition-all focus:shadow-[5px_5px_0_var(--color-meme-accent)] placeholder:text-meme-ink-2"
						/>
					</div>

					<Button
						variant="outline"
						className="shrink-0 gap-2.5 border-2 px-5! py-4.75 hover:bg-meme-accent2"
						nativeButton={false}
						render={
							<a
								href={REPO_URL}
								target="_blank"
								rel="noreferrer"
								aria-label={`Open GitHub repository, ${repoStarsLabel}`}
							/>
						}
					>
						<Github data-icon="inline-start" strokeWidth={3} />
						<span className="font-mono font-bold">
							{repoStarsLabel}
						</span>
					</Button>
				</div>
			</div>

			<div className="mt-5 overflow-hidden whitespace-nowrap rounded-full border-2 border-meme-ink bg-meme-ink py-3 font-heading text-sm tracking-widest text-meme-accent2 shadow-[4px_4px_0_var(--color-meme-ink)] -rotate-1">
				<div className="inline-block animate-ribbon">
					<span>
						✦ MEME STASH ✦ CLICK TO EXPORT ✦ SCROLL FOR MORE ✦ MEME
						STASH ✦ CLICK TO EXPORT ✦ SCROLL FOR MORE ✦ MEME STASH ✦
						CLICK TO EXPORT ✦ SCROLL FOR MORE ✦ MEME STASH ✦ CLICK
						TO EXPORT ✦ SCROLL FOR MORE
					</span>
					<span>
						✦ MEME STASH ✦ CLICK TO EXPORT ✦ SCROLL FOR MORE ✦ MEME
						STASH ✦ CLICK TO EXPORT ✦ SCROLL FOR MORE ✦ MEME STASH ✦
						CLICK TO EXPORT ✦ SCROLL FOR MORE ✦ MEME STASH ✦ CLICK
						TO EXPORT ✦ SCROLL FOR MORE
					</span>
				</div>
			</div>
		</header>
	)
}
