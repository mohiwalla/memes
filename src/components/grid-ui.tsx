import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { computeMasonryLayout } from "@/lib/masonry-layout"
import { MemeTile } from "./meme-tile"

type MemeGridProps = {
	items: string[]
	search: string
	onOpenMeme: (name: string) => void
}

const OVERSCAN_VIEWPORTS = 1.5
const SCROLL_BLUR_IDLE_MS = 48
const REGULAR_SCROLL_SPEED_PX_PER_MS = 1.8
const MAX_SCROLL_SPEED_PX_PER_MS = 12
const MAX_SCROLL_BLUR_PX = 3.5
const MIN_VIRTUALIZED_RESULTS = 12
const CARD_ENTER_TRANSITION = {
	type: "spring",
	stiffness: 520,
	damping: 36,
	mass: 0.75,
} as const
const CARD_EXIT_TRANSITION = {
	duration: 0.18,
	ease: [0.22, 1, 0.36, 1],
} as const
const CARD_STAGGER_SECONDS = 0.018

const cardMotionVariants = {
	hidden: (animateResultChange: boolean) =>
		animateResultChange
			? {
					opacity: 0,
					y: 24,
					scale: 0.92,
					rotate: -1.8,
				}
			: {
					opacity: 1,
					y: 0,
					scale: 1,
					rotate: 0,
				},
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		rotate: 0,
	},
	exit: (animateResultChange: boolean) =>
		animateResultChange
			? {
					opacity: 0,
					y: -18,
					scale: 0.88,
					rotate: 2.2,
					transition: CARD_EXIT_TRANSITION,
				}
			: {
					opacity: 1,
					y: 0,
					scale: 1,
					rotate: 0,
					transition: { duration: 0 },
				},
}

type ViewportState = {
	gridTop: number
	gridWidth: number
	scrollY: number
	viewportHeight: number
}

const getInitialViewportState = (): ViewportState => ({
	gridTop: 0,
	gridWidth: 0,
	scrollY: typeof window === "undefined" ? 0 : window.scrollY,
	viewportHeight: typeof window === "undefined" ? 0 : window.innerHeight,
})

export function GridUI({ items, search, onOpenMeme }: MemeGridProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const lastScrollSampleRef = useRef({
		time: 0,
		y: 0,
	})
	const reduceMotion = useReducedMotion()
	const scrollIdleTimeoutRef = useRef<number | null>(null)
	const [scrollBlurPx, setScrollBlurPx] = useState(0)
	const [viewportState, setViewportState] = useState(getInitialViewportState)
	const [measuredRatios, setMeasuredRatios] = useState<
		Record<string, number>
	>({})
	const [renderedResultSet, setRenderedResultSet] = useState(() => ({
		items,
		isAnimating: false,
	}))
	const renderedItems = renderedResultSet.items
	const animateResultChange = renderedResultSet.isAnimating && !reduceMotion
	const shouldVirtualize = renderedItems.length >= MIN_VIRTUALIZED_RESULTS

	useEffect(() => {
		const updateTimeoutId = window.setTimeout(() => {
			setRenderedResultSet(previous => {
				if (previous.items === items) return previous

				return {
					items,
					isAnimating: true,
				}
			})
		}, 0)
		const animationTimeoutId = window.setTimeout(() => {
			setRenderedResultSet(previous => {
				if (previous.items !== items || !previous.isAnimating) {
					return previous
				}

				return {
					items: previous.items,
					isAnimating: false,
				}
			})
		}, 360)

		return () => {
			window.clearTimeout(updateTimeoutId)
			window.clearTimeout(animationTimeoutId)
		}
	}, [items])

	useEffect(() => {
		let rafId = 0
		lastScrollSampleRef.current = {
			time: performance.now(),
			y: window.scrollY,
		}

		const updateViewportState = () => {
			rafId = 0

			const containerRect = containerRef.current?.getBoundingClientRect()
			const next = {
				gridTop: Math.round(
					containerRect ? containerRect.top + window.scrollY : 0,
				),
				gridWidth: Math.round(containerRect?.width ?? 0),
				scrollY: Math.round(window.scrollY),
				viewportHeight: window.innerHeight,
			}

			setViewportState(previous =>
				previous.gridTop === next.gridTop &&
				previous.gridWidth === next.gridWidth &&
				previous.scrollY === next.scrollY &&
				previous.viewportHeight === next.viewportHeight
					? previous
					: next,
			)
		}

		const scheduleViewportStateUpdate = () => {
			if (rafId) return
			rafId = window.requestAnimationFrame(updateViewportState)
		}

		const handleScroll = () => {
			scheduleViewportStateUpdate()

			const now = performance.now()
			const y = window.scrollY
			const elapsed = Math.max(1, now - lastScrollSampleRef.current.time)
			const speed = Math.abs(y - lastScrollSampleRef.current.y) / elapsed
			const blurRatio = Math.min(
				1,
				Math.max(
					0,
					(speed - REGULAR_SCROLL_SPEED_PX_PER_MS) /
						(MAX_SCROLL_SPEED_PX_PER_MS -
							REGULAR_SCROLL_SPEED_PX_PER_MS),
				),
			)

			setScrollBlurPx(Number((blurRatio * MAX_SCROLL_BLUR_PX).toFixed(2)))
			lastScrollSampleRef.current = { time: now, y }

			if (scrollIdleTimeoutRef.current) {
				window.clearTimeout(scrollIdleTimeoutRef.current)
			}
			scrollIdleTimeoutRef.current = window.setTimeout(() => {
				setScrollBlurPx(0)
			}, SCROLL_BLUR_IDLE_MS)
		}

		const resizeObserver = new ResizeObserver(scheduleViewportStateUpdate)
		if (containerRef.current) {
			resizeObserver.observe(containerRef.current)
		}

		scheduleViewportStateUpdate()
		window.addEventListener("scroll", handleScroll, {
			passive: true,
		})
		window.addEventListener("resize", scheduleViewportStateUpdate)

		return () => {
			if (rafId) {
				window.cancelAnimationFrame(rafId)
			}
			if (scrollIdleTimeoutRef.current) {
				window.clearTimeout(scrollIdleTimeoutRef.current)
			}
			resizeObserver.disconnect()
			window.removeEventListener("scroll", handleScroll)
			window.removeEventListener("resize", scheduleViewportStateUpdate)
		}
	}, [])

	const handleNaturalSize = useCallback(
		(name: string, width: number, height: number) => {
			if (!width || !height) return

			setMeasuredRatios(previous =>
				previous[name] === height / width
					? previous
					: { ...previous, [name]: height / width },
			)
		},
		[],
	)

	const layout = useMemo(
		() =>
			computeMasonryLayout(renderedItems, {
				width: viewportState.gridWidth,
				measuredRatios,
			}),
		[renderedItems, viewportState.gridWidth, measuredRatios],
	)

	const overscanPx = viewportState.viewportHeight * OVERSCAN_VIEWPORTS
	const viewportTop = viewportState.scrollY - viewportState.gridTop
	const visibleTop = viewportTop - overscanPx
	const visibleBottom =
		viewportTop + viewportState.viewportHeight + overscanPx
	const visibleTiles = shouldVirtualize
		? layout.tiles.filter(
				tile =>
					tile.y + tile.height >= visibleTop &&
					tile.y <= visibleBottom,
			)
		: layout.tiles

	return (
		<main className="relative z-0 px-4 pt-8 pb-20 min-[480px]:px-6 sm:px-12">
			<div
				ref={containerRef}
				className="relative"
				style={{ height: `${layout.height}px` }}
			>
				<AnimatePresence
					initial={false}
					custom={animateResultChange}
					mode="popLayout"
				>
					{visibleTiles.map((tile, index) => (
						<motion.div
							key={tile.name}
							custom={animateResultChange}
							variants={cardMotionVariants}
							initial={animateResultChange ? "hidden" : false}
							animate="visible"
							exit="exit"
							layout={animateResultChange ? "position" : false}
							transition={
								animateResultChange
									? {
											...CARD_ENTER_TRANSITION,
											delay:
												Math.min(index, 8) *
												CARD_STAGGER_SECONDS,
										}
									: { duration: 0 }
							}
							className="absolute hover:z-3"
							style={{
								left: tile.x,
								top: tile.y,
								width: tile.width,
								height: tile.height,
								willChange: animateResultChange
									? "opacity, transform"
									: undefined,
							}}
						>
							<MemeTile
								name={tile.name}
								loading="eager"
								scrollBlurPx={scrollBlurPx}
								onClick={() => onOpenMeme(tile.name)}
								onNaturalSize={handleNaturalSize}
							/>
						</motion.div>
					))}
				</AnimatePresence>
			</div>

			<AnimatePresence initial={false}>
				{renderedItems.length === 0 && (
					<motion.div
						key="empty-search"
						initial={
							reduceMotion
								? false
								: { opacity: 0, y: 18, scale: 0.96 }
						}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={
							reduceMotion
								? { opacity: 1 }
								: { opacity: 0, y: -10, scale: 0.98 }
						}
						transition={
							reduceMotion
								? { duration: 0 }
								: {
										type: "spring",
										stiffness: 420,
										damping: 34,
									}
						}
						className="py-20 text-center text-meme-ink-2"
					>
						<div className="flex justify-center">
							<img
								draggable="false"
								src="/images/404.png"
								className="w-full max-w-80 -mb-10"
							/>
						</div>

						<p className="text-base">
							No match found for <b>"{search}"</b>
						</p>
					</motion.div>
				)}
			</AnimatePresence>
		</main>
	)
}
