import { useEffect, useEffectEvent, useRef, useState } from "react"
import { Github, Search, X } from "lucide-react"
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
					<Button
						variant="outline"
						size="sm"
						className="shrink-0"
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
						<Github data-icon="inline-start" />
						GitHub
						<span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
							{repoStarsLabel}
						</span>
					</Button>
					<div className="relative flex items-center">
						<Search
							className="absolute left-3 h-3.75 w-3.75 text-meme-ink-2 pointer-events-none"
							strokeWidth={2.5}
						/>
						<input
							ref={searchRef}
							type="text"
							placeholder={`Search memes... (${shortcutLabel})`}
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
