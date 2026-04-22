import HomePage from "@/app/home"
import NotFoundPage from "@/app/not-found"
import { BrowserRouter, Route, Routes } from "react-router"

export default function Router() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="*" element={<NotFoundPage />} />
				<Route index path="/" element={<HomePage />} />
			</Routes>
		</BrowserRouter>
	)
}
