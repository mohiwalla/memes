import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react"
import { parseAsString, useQueryStates } from "nuqs"
import { searchMemes } from "@/lib/utils"

const DOUBLE_ESCAPE_CLEAR_MS = 500

const getHistoryIndex = () =>
	typeof window === "undefined" ? null : (window.history.state?.idx ?? null)

export function useMemeBrowser() {
	const [images, setImages] = useState<string[]>([])
	const [{ search, selectedMeme }, setUrlState] = useQueryStates(
		{
			search: parseAsString.withDefault(""),
			selectedMeme: parseAsString,
		},
		{
			urlKeys: {
				search: "q",
				selectedMeme: "meme",
			},
		},
	)
	const dismissibleModalHistoryEntriesRef = useRef(new Set<number>())
	const lastEscapeAtRef = useRef(0)

	useEffect(() => {
		fetch("/list.json")
			.then(res => res.json())
			.then(data => setImages(data))
			.catch(console.error)
	}, [])

	const filteredImages = useMemo(() => {
		return searchMemes(images, search)
	}, [images, search])

	const handleSearchChange = (value: string) => {
		void setUrlState({ search: value || null })
	}

	const handleGlobalEscapeKeyDown = useEffectEvent((event: KeyboardEvent) => {
		if (event.key !== "Escape" || event.repeat) return

		if (selectedMeme) {
			lastEscapeAtRef.current = 0
			return
		}

		const now = Date.now()
		const isDoubleEscape =
			now - lastEscapeAtRef.current <= DOUBLE_ESCAPE_CLEAR_MS
		lastEscapeAtRef.current = now

		if (!isDoubleEscape || !search) return

		event.preventDefault()
		void setUrlState({ search: null })
	})

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			handleGlobalEscapeKeyDown(event)
		}

		window.addEventListener("keydown", onKeyDown, { capture: true })
		return () =>
			window.removeEventListener("keydown", onKeyDown, { capture: true })
	}, [])

	const handleTagClick = (tag: string) => {
		void setUrlState(
			{
				search: tag,
				selectedMeme: null,
			},
			{ history: "push" },
		)
	}

	const openMeme = (name: string) => {
		const currentHistoryIndex = getHistoryIndex()
		if (currentHistoryIndex !== null) {
			dismissibleModalHistoryEntriesRef.current.add(
				currentHistoryIndex + 1,
			)
		}

		void setUrlState({ selectedMeme: name }, { history: "push" })
	}

	const closeMeme = () => {
		const currentHistoryIndex = getHistoryIndex()

		if (
			currentHistoryIndex !== null &&
			dismissibleModalHistoryEntriesRef.current.has(currentHistoryIndex)
		) {
			window.history.back()
			return
		}

		void setUrlState({ selectedMeme: null })
	}

	useEffect(() => {
		if (!selectedMeme) return

		if (images.length > 0 && !images.includes(selectedMeme)) {
			void setUrlState({ selectedMeme: null })
		}
	}, [images, selectedMeme, setUrlState])

	return {
		filteredImages,
		handleSearchChange,
		handleTagClick,
		openMeme,
		closeMeme,
		search,
		selectedMeme,
	}
}
