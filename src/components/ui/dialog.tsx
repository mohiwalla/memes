import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

const dialogOverlayVariants = cva(
	"fixed inset-0 isolate z-50 duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
	{
		variants: {
			variant: {
				default:
					"bg-black/10 supports-backdrop-filter:backdrop-blur-xs",
				meme: "bg-meme-ink/70 supports-backdrop-filter:backdrop-blur-sm",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
)

const dialogContentVariants = cva(
	"fixed z-50 duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
	{
		variants: {
			variant: {
				default:
					"top-1/2 left-1/2 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 sm:max-w-sm",
				meme: "top-1/2 left-1/2 grid max-h-[92vh] w-full max-w-[1060px] -translate-x-1/2 -translate-y-1/2 grid-cols-1 overflow-hidden rounded-[28px] border-3 border-meme-ink bg-meme-paper text-sm text-meme-ink shadow-[10px_10px_0_var(--color-meme-ink)] md:grid-cols-[1.1fr_1fr]",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
)

type DialogVariant = VariantProps<typeof dialogContentVariants>["variant"]

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
	return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
	return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
	return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
	return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
	className,
	variant,
	...props
}: DialogPrimitive.Backdrop.Props & { variant?: DialogVariant }) {
	return (
		<DialogPrimitive.Backdrop
			data-slot="dialog-overlay"
			className={cn(dialogOverlayVariants({ variant }), className)}
			{...props}
		/>
	)
}

function DialogContent({
	className,
	children,
	showCloseButton = true,
	variant = "default",
	...props
}: DialogPrimitive.Popup.Props & {
	showCloseButton?: boolean
	variant?: DialogVariant
}) {
	return (
		<DialogPortal>
			<DialogOverlay variant={variant} />
			<DialogPrimitive.Popup
				data-slot="dialog-content"
				className={cn(dialogContentVariants({ variant }), className)}
				{...props}
			>
				{children}
				{showCloseButton &&
					(variant === "meme" ? (
						<DialogPrimitive.Close
							data-slot="dialog-close"
							className="absolute top-3.5 right-3.5 z-10 flex size-10 items-center justify-center rounded-full border-2 border-meme-ink bg-meme-paper font-bold text-meme-ink shadow-[3px_3px_0_var(--color-meme-ink)] transition-all hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-meme-accent hover:text-meme-paper hover:shadow-[5px_5px_0_var(--color-meme-ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_var(--color-meme-ink)] focus-visible:border-meme-accent focus-visible:ring-0"
						>
							<XIcon />
							<span className="sr-only">Close</span>
						</DialogPrimitive.Close>
					) : (
						<DialogPrimitive.Close
							data-slot="dialog-close"
							render={
								<Button
									variant="ghost"
									className="absolute top-2 right-2"
									size="icon-sm"
								/>
							}
						>
							<XIcon />
							<span className="sr-only">Close</span>
						</DialogPrimitive.Close>
					))}
			</DialogPrimitive.Popup>
		</DialogPortal>
	)
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="dialog-header"
			className={cn("flex flex-col gap-2", className)}
			{...props}
		/>
	)
}

function DialogFooter({
	className,
	showCloseButton = false,
	children,
	...props
}: React.ComponentProps<"div"> & {
	showCloseButton?: boolean
}) {
	return (
		<div
			data-slot="dialog-footer"
			className={cn(
				"-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
				className,
			)}
			{...props}
		>
			{children}
			{showCloseButton && (
				<DialogPrimitive.Close render={<Button variant="outline" />}>
					Close
				</DialogPrimitive.Close>
			)}
		</div>
	)
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
	return (
		<DialogPrimitive.Title
			data-slot="dialog-title"
			className={cn(
				"font-heading text-base leading-none font-medium",
				className,
			)}
			{...props}
		/>
	)
}

function DialogDescription({
	className,
	...props
}: DialogPrimitive.Description.Props) {
	return (
		<DialogPrimitive.Description
			data-slot="dialog-description"
			className={cn(
				"text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
				className,
			)}
			{...props}
		/>
	)
}

export {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
}
