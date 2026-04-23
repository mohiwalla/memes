import { useState } from "react"
import { cn } from "@/lib/utils"
import { getAssetUrl, getExt, makeTitle } from "@/lib/utils"

type MemeTileProps = {
	name: string
	loading?: "eager" | "lazy"
	scrollBlurPx?: number
	onClick: () => void
}

export function MemeTile({
	name,
	loading = "lazy",
	scrollBlurPx = 0,
	onClick,
}: MemeTileProps) {
	const [loaded, setLoaded] = useState(false)
	const ext = getExt(name)

	return (
		<button
			className="group relative block w-full animate-tile-in rounded-meme border-[2.5px] border-meme-ink bg-meme-paper p-2 pb-0 text-left shadow-[5px_5px_0_var(--color-meme-ink)] transition-all hover:z-3 hover:scale-[1.015] hover:-translate-y-1.25 hover:-translate-x-0.75 hover:shadow-[10px_12px_0_var(--color-meme-ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_var(--color-meme-ink)] sm:p-2.5"
			onClick={onClick}
		>
			<div
				className={cn(
					"relative aspect-4/3 overflow-hidden rounded-lg bg-meme-bg-2 transition-opacity",
					!loaded &&
						"after:absolute after:inset-0 after:bg-linear-to-r after:from-transparent after:via-white/35 after:to-transparent after:bg-size-[200%_100%] after:animate-shimmer",
				)}
			>
				<img
					src={getAssetUrl(name)}
					alt={makeTitle(name)}
					loading={loading}
					decoding="async"
					onLoad={() => setLoaded(true)}
					onError={() => setLoaded(true)}
					className={cn(
						"block h-full w-full object-contain transition-[filter,opacity,transform] duration-200 ease-out will-change-[filter,opacity,transform] motion-reduce:transition-none",
						loaded
							? "scale-100 opacity-100"
							: "scale-[1.03] opacity-0 blur-xl",
					)}
					style={{
						filter:
							loaded && scrollBlurPx
								? `blur(${scrollBlurPx}px)`
								: undefined,
						transitionDuration: scrollBlurPx ? "40ms" : undefined,
					}}
				/>
				<span
					className={cn(
						"absolute top-1.5 right-1.5 rotate-6 rounded-full border-2 border-meme-ink px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-meme-ink sm:top-2 sm:right-2 sm:px-2.5 sm:py-1 sm:text-[10px]",
						ext === "gif" && "bg-meme-accent",
						ext === "png" && "bg-[#4CC9F0]",
						ext === "webp" && "bg-[#7CFF6B]",
						(ext === "jpg" || ext === "jpeg") && "bg-meme-accent2",
					)}
				>
					{ext}
				</span>
			</div>
			<div className="overflow-hidden text-ellipsis whitespace-nowrap p-2 px-1 text-[11px] font-semibold tracking-tight sm:p-3 sm:px-1 sm:text-[13px]">
				{makeTitle(name)}
			</div>
		</button>
	)
}
