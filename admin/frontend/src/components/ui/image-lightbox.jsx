import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ImageLightbox({ images, currentIndex, onClose, onPrev, onNext }) {
	if (!images || images.length === 0) return null;

	const currentImage = images[currentIndex];

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="max-w-[90vw] max-h-[90vh] p-0 border-none bg-black/90">
				<DialogTitle className="sr-only">
					Imagen {currentIndex + 1} de {images.length}
				</DialogTitle>

				<div className="relative flex items-center justify-center min-h-[60vh]">
					<img
						src={currentImage}
						alt=""
						className="max-w-full max-h-[85vh] object-contain"
					/>

					{images.length > 1 && (
						<>
							<Button
								variant="ghost"
								size="icon"
								className="absolute left-2 text-white hover:bg-white/20"
								onClick={onPrev}
							>
								<ChevronLeft className="h-8 w-8" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="absolute right-2 text-white hover:bg-white/20"
								onClick={onNext}
							>
								<ChevronRight className="h-8 w-8" />
							</Button>
						</>
					)}

					<div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
						{currentIndex + 1} / {images.length}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export function useImageLightbox() {
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [lightboxImages, setLightboxImages] = useState([]);
	const [lightboxIndex, setLightboxIndex] = useState(0);

	const openLightbox = (images, startIndex = 0) => {
		setLightboxImages(images);
		setLightboxIndex(startIndex);
		setLightboxOpen(true);
	};

	const closeLightbox = () => {
		setLightboxOpen(false);
	};

	const goToPrev = () => {
		setLightboxIndex((prev) => (prev === 0 ? lightboxImages.length - 1 : prev - 1));
	};

	const goToNext = () => {
		setLightboxIndex((prev) => (prev === lightboxImages.length - 1 ? 0 : prev + 1));
	};

	return {
		lightboxOpen,
		lightboxImages,
		lightboxIndex,
		openLightbox,
		closeLightbox,
		goToPrev,
		goToNext,
	};
}
