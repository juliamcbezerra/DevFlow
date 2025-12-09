import { useState, useCallback } from "react";

export interface UseImagePickerOptions {
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
  folderType?: "profile-pictures" | "user-banners" | "project-images" | "project-banners" | "posts" | "comments" | "message-images";
}

export function useImagePicker(options: UseImagePickerOptions = {}) {
  const {
    onSuccess,
    onError,
    folderType = "profile-pictures",
  } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");

  const openPicker = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closePicker = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleImageSelect = useCallback(
    async (imageUrl: string) => {
      try {
        setSelectedImage(imageUrl);
        onSuccess?.(imageUrl);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro ao selecionar imagem";
        onError?.(errorMessage);
      }
    },
    [onSuccess, onError]
  );

  return {
    isOpen,
    selectedImage,
    openPicker,
    closePicker,
    handleImageSelect,
    folderType,
  };
}
