import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "@/app/global.css"
import Router from "@/app/router"

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Router />
	</StrictMode>,
)
