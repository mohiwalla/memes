import HomePage from "@/app/home"
import NotFoundPage from "@/app/not-found"
import { NuqsAdapter } from "nuqs/adapters/react-router/v7"
import { BrowserRouter, Route, Routes } from "react-router"

export default function Router() {
	return (
		<BrowserRouter>
			<NuqsAdapter>
				<Routes>
					<Route path="*" element={<NotFoundPage />} />
					<Route index path="/" element={<HomePage />} />
				</Routes>
			</NuqsAdapter>
		</BrowserRouter>
	)
}
