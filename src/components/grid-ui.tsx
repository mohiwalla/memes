import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { MemeTile } from "./meme-tile"

type MemeGridProps = {
	cols: number
	items: string[]
	search: string
	onOpenMeme: (name: string) => void
}

const GAP_PX = 22
const MIN_OVERSCAN_ROWS = 10
const MAX_OVERSCAN_ROWS = 30
const OVERSCAN_VIEWPORTS = 4
const SCROLL_BLUR_IDLE_MS = 48
const REGULAR_SCROLL_SPEED_PX_PER_MS = 1.8
const MAX_SCROLL_SPEED_PX_PER_MS = 12
const MAX_SCROLL_BLUR_PX = 3.5
const MIN_TILE_HEIGHT = 160
const TILE_HORIZONTAL_PADDING_PX = 20
const TILE_TOP_PADDING_PX = 10
const TILE_TITLE_HEIGHT_PX = 44
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

type VirtualState = {
	gridTop: number
	gridWidth: number
	scrollY: number
	tileHeight: number
	viewportHeight: number
}

const getInitialVirtualState = (): VirtualState => ({
	gridTop: 0,
	gridWidth: 0,
	scrollY: typeof window === "undefined" ? 0 : window.scrollY,
	tileHeight: 260,
	viewportHeight: typeof window === "undefined" ? 0 : window.innerHeight,
})

const getEstimatedTileHeight = (gridWidth: number, cols: number) => {
	const columnWidth = (gridWidth - GAP_PX * Math.max(0, cols - 1)) / cols
	const imageWidth = Math.max(0, columnWidth - TILE_HORIZONTAL_PADDING_PX)

	return Math.max(
		MIN_TILE_HEIGHT,
		Math.round(
			imageWidth * 0.75 + TILE_TOP_PADDING_PX + TILE_TITLE_HEIGHT_PX,
		),
	)
}

export function GridUI({ cols, items, search, onOpenMeme }: MemeGridProps) {
	const safeCols = Math.max(1, cols)
	const containerRef = useRef<HTMLDivElement>(null)
	const measureRef = useRef<HTMLDivElement>(null)
	const lastScrollSampleRef = useRef({
		time: 0,
		y: 0,
	})
	const reduceMotion = useReducedMotion()
	const scrollIdleTimeoutRef = useRef<number | null>(null)
	const [scrollBlurPx, setScrollBlurPx] = useState(0)
	const [virtualState, setVirtualState] = useState(getInitialVirtualState)
	const [renderedResultSet, setRenderedResultSet] = useState(() => ({
		items,
		isAnimating: false,
	}))
	const renderedItems = renderedResultSet.items
	const animateResultChange = renderedResultSet.isAnimating && !reduceMotion

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

		const updateVirtualState = () => {
			rafId = 0

			const container = containerRef.current
			const containerRect = container?.getBoundingClientRect()
			const gridWidth = Math.round(containerRect?.width ?? 0)
			const gridTop = Math.round(
				containerRect ? containerRect.top + window.scrollY : 0,
			)
			const measuredTileHeight = Math.round(
				measureRef.current?.getBoundingClientRect().height ?? 0,
			)
			const tileHeight =
				measuredTileHeight ||
				getEstimatedTileHeight(gridWidth, safeCols)

			setVirtualState(previous => {
				const next = {
					gridTop,
					gridWidth,
					scrollY: Math.round(window.scrollY),
					tileHeight,
					viewportHeight: window.innerHeight,
				}

				if (
					previous.gridTop === next.gridTop &&
					previous.gridWidth === next.gridWidth &&
					previous.scrollY === next.scrollY &&
					previous.tileHeight === next.tileHeight &&
					previous.viewportHeight === next.viewportHeight
				) {
					return previous
				}

				return next
			})
		}

		const scheduleVirtualStateUpdate = () => {
			if (rafId) return
			rafId = window.requestAnimationFrame(updateVirtualState)
		}

		const handleScroll = () => {
			scheduleVirtualStateUpdate()

			const now = performance.now()
			const y = window.scrollY
			const elapsed = Math.max(1, now - lastScrollSampleRef.current.time)
			const speed = Math.abs(y - lastScrollSampleRef.current.y) / elapsed
			const blurRatio = Math.min(
				1,
				Math.max(
					0,
					(speed - REGULAR_SCROLL_SPEED_PX_PER_MS) /
						(MAX_SCROLL_SPEED_PX_PER_MS - REGULAR_SCROLL_SPEED_PX_PER_MS),
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

		const resizeObserver = new ResizeObserver(scheduleVirtualStateUpdate)
		if (containerRef.current) {
			resizeObserver.observe(containerRef.current)
		}

		scheduleVirtualStateUpdate()
		window.addEventListener("scroll", handleScroll, {
			passive: true,
		})
		window.addEventListener("resize", scheduleVirtualStateUpdate)

		return () => {
			if (rafId) {
				window.cancelAnimationFrame(rafId)
			}
			if (scrollIdleTimeoutRef.current) {
				window.clearTimeout(scrollIdleTimeoutRef.current)
			}
			resizeObserver.disconnect()
			window.removeEventListener("scroll", handleScroll)
			window.removeEventListener("resize", scheduleVirtualStateUpdate)
		}
	}, [safeCols, renderedItems.length])

	const totalRows = Math.ceil(renderedItems.length / safeCols)
	const rowHeight = virtualState.tileHeight + GAP_PX
	const viewportRows = Math.ceil(virtualState.viewportHeight / rowHeight)
	const overscanRows = Math.min(
		MAX_OVERSCAN_ROWS,
		Math.max(MIN_OVERSCAN_ROWS, viewportRows * OVERSCAN_VIEWPORTS),
	)
	const gridHeight =
		totalRows === 0
			? 0
			: totalRows * virtualState.tileHeight + (totalRows - 1) * GAP_PX
	const viewportTop = virtualState.scrollY - virtualState.gridTop
	const viewportBottom = viewportTop + virtualState.viewportHeight
	const rawStartRow = Math.max(
		0,
		Math.floor(viewportTop / rowHeight) - overscanRows,
	)
	const rawEndRow = Math.min(
		totalRows,
		Math.ceil(viewportBottom / rowHeight) + overscanRows,
	)
	const startRow = totalRows === 0 ? 0 : Math.min(rawStartRow, totalRows - 1)
	const endRow = Math.min(totalRows, Math.max(startRow + 1, rawEndRow))
	const startIndex = startRow * safeCols
	const endIndex = Math.min(renderedItems.length, endRow * safeCols)
	const offsetY = startRow * rowHeight
	const visibleItems = useMemo(
		() => renderedItems.slice(startIndex, endIndex),
		[renderedItems, startIndex, endIndex],
	)

	return (
		<main className="relative z-0 px-6 pt-8 pb-20 sm:px-12">
			<div
				ref={containerRef}
				className="relative"
				style={{ height: `${gridHeight}px` }}
			>
				<div
					className="absolute right-0 left-0 grid gap-5.5"
					style={{
						gridTemplateColumns: `repeat(${safeCols}, 1fr)`,
						transform: `translateY(${offsetY}px)`,
					}}
				>
					<AnimatePresence
						initial={false}
						custom={animateResultChange}
						mode="popLayout"
					>
						{visibleItems.map((name, index) => (
							<motion.div
								key={name}
								ref={index === 0 ? measureRef : undefined}
								custom={animateResultChange}
								variants={cardMotionVariants}
								initial={
									animateResultChange ? "hidden" : false
								}
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
								style={{
									willChange: animateResultChange
										? "opacity, transform"
										: undefined,
								}}
							>
								<MemeTile
									name={name}
									loading="eager"
									scrollBlurPx={scrollBlurPx}
									onClick={() => onOpenMeme(name)}
								/>
							</motion.div>
						))}
					</AnimatePresence>
				</div>
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
						<div className="mb-3 text-5xl">🔍</div>
						<p className="text-base">
							no memes match <b>"{search}"</b>
						</p>
					</motion.div>
				)}
			</AnimatePresence>
		</main>
	)
}
