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

	return (
		<div className="min-h-screen">
			<Header
				search={search}
				onSearchChange={handleSearchChange}
				filteredCount={filteredImages.length}
				isSearchHotkeyEnabled={!selectedMeme}
			/>

			<GridUI
				cols={4}
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
