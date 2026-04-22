import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router"
import { ArrowLeft, Home } from "lucide-react"

export default function NotFoundPage() {
	const navigate = useNavigate()

	return (
		<main className="h-[calc(100vh-69px)] grid place-items-center">
			<div className="flex flex-col gap-4 p-6 text-center max-w-[300px]">
				<hgroup>
					<h1 className="text-6xl font-bold">404</h1>
					<p className="text-muted-foreground">Page not found</p>
				</hgroup>

				<p>
					The page you're looking for doesn't exist or has been moved.
				</p>

				<div className="flex gap-3 sm:flex-row flex-col mt-6">
					<Button
						variant="outline"
						className="gap-1.5 grow"
						onClick={() =>
							history.length > 1 ? history.back() : navigate("/")
						}
					>
						<ArrowLeft /> Go back
					</Button>
					<Button
						className="gap-1.5 grow"
						onClick={() => navigate("/")}
					>
						<Home /> Return Home
					</Button>
				</div>
			</div>
		</main>
	)
}
