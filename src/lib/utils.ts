import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export const makeTitle = (name: string) =>
	(TITLES_DATABASE[name] ??
		name
		.replace(/\.[^.]+$/, "")
		.replace(/-/g, " ")
		.replace(/\b\w/g, c => c.toUpperCase()))

export const getExt = (name: string) =>
	(name.match(/\.([^.]+)$/) || ["", ""])[1].toLowerCase()

export const loadImg = (src: string): Promise<HTMLImageElement> =>
	new Promise((res, rej) => {
		const img = new Image()
		img.crossOrigin = "anonymous"
		img.onload = () => res(img)
		img.onerror = rej
		img.src = src
	})

export const triggerDownload = (href: string, filename: string) => {
	const a = document.createElement("a")
	a.href = href
	a.download = filename
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
}

import { TAGS_DATABASE } from "@/lib/tags-database"
import { TITLES_DATABASE } from "@/lib/titles-database"

type SearchEntry = {
	normalizedName: string
	normalizedTitle: string
	normalizedTags: string[]
}

const searchEntryCache = new Map<string, SearchEntry>()

const normalizeSearchValue = (value: string) =>
	value
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/\.[^.]+$/, "")
		.replace(/[_./-]+/g, " ")
		.replace(/[^\w\s]/g, " ")
		.replace(/\s+/g, " ")
		.trim()

const getSubsequenceScore = (needle: string, haystack: string) => {
	let lastMatch = -1
	let gapPenalty = 0

	for (const char of needle) {
		const matchIndex = haystack.indexOf(char, lastMatch + 1)
		if (matchIndex === -1) return 0
		if (lastMatch !== -1) gapPenalty += matchIndex - lastMatch - 1
		lastMatch = matchIndex
	}

	return Math.max(1, 40 - gapPenalty)
}

const getFieldScore = (token: string, field: string) => {
	if (!field) return 0
	if (field === token) return 140
	if (field.startsWith(token)) return 120
	if (field.split(" ").some(part => part.startsWith(token))) return 105

	const containsIndex = field.indexOf(token)
	if (containsIndex !== -1) return Math.max(80 - containsIndex, 50)

	return getSubsequenceScore(token, field)
}

const getSearchEntry = (name: string): SearchEntry => {
	const cachedEntry = searchEntryCache.get(name)
	if (cachedEntry) return cachedEntry

	const entry = {
		normalizedName: normalizeSearchValue(name),
		normalizedTitle: normalizeSearchValue(makeTitle(name)),
		normalizedTags: (TAGS_DATABASE[name] ?? []).map(normalizeSearchValue),
	}

	searchEntryCache.set(name, entry)
	return entry
}

export const getTagsForMeme = (name: string) => TAGS_DATABASE[name] ?? []

export function searchMemes(images: string[], query: string) {
	const normalizedQuery = normalizeSearchValue(query)
	if (!normalizedQuery) return images

	const tokens = normalizedQuery.split(" ").filter(Boolean)

	return images
		.map(name => {
			const entry = getSearchEntry(name)
			const fields = [
				entry.normalizedName,
				entry.normalizedTitle,
				...entry.normalizedTags,
			]

			let score = 0
			for (const token of tokens) {
				const bestScore = fields.reduce(
					(maxScore, field) =>
						Math.max(maxScore, getFieldScore(token, field)),
					0,
				)

				if (!bestScore) return null
				score += bestScore
			}

			if (
				entry.normalizedName === normalizedQuery ||
				entry.normalizedTitle === normalizedQuery
			) {
				score += 240
			} else if (
				entry.normalizedName.startsWith(normalizedQuery) ||
				entry.normalizedTitle.startsWith(normalizedQuery)
			)
				score += 180
			else if (
				entry.normalizedName.includes(normalizedQuery) ||
				entry.normalizedTitle.includes(normalizedQuery)
			)
				score += 120
			else if (
				entry.normalizedTags.some(
					tag =>
						tag === normalizedQuery ||
						tag.includes(normalizedQuery),
				)
			) {
				score += 80
			}

			return { name, score }
		})
		.filter(result => result !== null)
		.sort((left, right) => {
			if (right.score !== left.score) return right.score - left.score
			return left.name.localeCompare(right.name)
		})
		.map(result => result.name)
}
