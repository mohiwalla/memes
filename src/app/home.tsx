import { useEffect, useState } from "react"
import { Footer } from "@/components/footer"
import { GridUI } from "@/components/grid-ui"
import { Header } from "@/components/header"
import { SelectedMemeExportModal } from "@/components/selected-meme-export-modal"
import { useMemeBrowser } from "@/hooks/use-meme-browser"

export default function HomePage() {
	const {
		filteredImages,
		handleSearchChange,
		handleTagClick,
		openMeme,
		closeMeme,
		search,
		selectedMeme,
	} = useMemeBrowser()

	const [cols, setCols] = useState(4)

	useEffect(() => {
		const updateCols = () => {
			const width = window.innerWidth
			if (width < 640) setCols(1)
			else if (width < 1024) setCols(2)
			else if (width < 1280) setCols(3)
			else setCols(4)
		}

		updateCols()
		window.addEventListener("resize", updateCols)
		return () => window.removeEventListener("resize", updateCols)
	}, [])

	return (
		<div className="min-h-screen">
			<Header
				search={search}
				onSearchChange={handleSearchChange}
				filteredCount={filteredImages.length}
			/>

			<GridUI
				cols={cols}
				items={filteredImages}
				search={search}
				onOpenMeme={openMeme}
			/>

			<Footer memeCount={filteredImages.length} />

			{selectedMeme && (
				<SelectedMemeExportModal
					key={selectedMeme}
					selectedMeme={selectedMeme}
					onClose={closeMeme}
					onTagClick={handleTagClick}
				/>
			)}
		</div>
	)
}
