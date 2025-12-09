import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Upload, Link as LinkIcon, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (imageUrl: string) => Promise<void>;
  title?: string;
  description?: string;
  currentImage?: string;
  folderType?: "profile-pictures" | "user-banners" | "project-images" | "project-banners" | "posts" | "comments" | "message-images";
}

type Tab = "upload" | "link";

interface UploadState {
  isLoading: boolean;
  error: string | null;
  isDragging: boolean;
}

export function ImagePickerModal({
  isOpen,
  onClose,
  onImageSelect,
  title = "Selecionar Imagem",
  description = "Faça upload de uma imagem ou insira um link",
  currentImage,
  folderType = "profile-pictures",
}: ImagePickerModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("upload");
  const [linkInput, setLinkInput] = useState("");
  const [uploadState, setUploadState] = useState<UploadState>({
    isLoading: false,
    error: null,
    isDragging: false,
  });
  const [preview, setPreview] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validação de imagem
  const ALLOWED_FORMATS = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FORMATS.includes(file.type)) {
      return "Formato não suportado. Use JPEG, PNG, WebP ou GIF.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Arquivo muito grande. Máximo 5MB.";
    }
    return null;
  };

  const handleFileSelect = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      setUploadState({ isLoading: false, error, isDragging: false });
      return;
    }

    // Criar preview local
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      setSelectedFile(file);
      setUploadState({ isLoading: false, error: null, isDragging: false });
    };
    reader.onerror = () => {
      setUploadState({
        isLoading: false,
        error: "Erro ao ler arquivo",
        isDragging: false,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setUploadState((prev) => ({ ...prev, isDragging: true }));
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setUploadState((prev) => ({ ...prev, isDragging: false }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setUploadState((prev) => ({ ...prev, isDragging: false }));

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleLinkSubmit = async () => {
    if (!linkInput.trim()) {
      setUploadState({ isLoading: false, error: "Digite uma URL válida", isDragging: false });
      return;
    }

    setUploadState({ isLoading: true, error: null, isDragging: false });

    try {
      // Validar se a URL é acessível
      const img = new Image();
      img.onload = async () => {
        await onImageSelect(linkInput);
        setUploadState({ isLoading: false, error: null, isDragging: false });
        handleClose();
      };
      img.onerror = () => {
        setUploadState({
          isLoading: false,
          error: "URL inválida ou imagem inacessível",
          isDragging: false,
        });
      };
      img.src = linkInput;
    } catch (err) {
      setUploadState({
        isLoading: false,
        error: "Erro ao validar URL",
        isDragging: false,
      });
    }
  };

  const handleUploadConfirm = async () => {
    if (!selectedFile) return;

    setUploadState({ isLoading: true, error: null, isDragging: false });

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(`http://localhost:3333/uploads/${folderType}`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erro ao fazer upload");
      }

      const data = await response.json();
      const imageUrl = data.fileUrl || data.url;

      if (!imageUrl) {
        throw new Error("URL da imagem não recebida");
      }

      await onImageSelect(imageUrl);
      setUploadState({ isLoading: false, error: null, isDragging: false });
      handleClose();
    } catch (err) {
      setUploadState({
        isLoading: false,
        error: "Erro ao fazer upload. Tente novamente.",
        isDragging: false,
      });
    }
  };

  const handleClose = () => {
    setLinkInput("");
    setPreview("");
    setSelectedFile(null);
    setUploadState({ isLoading: false, error: null, isDragging: false });
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in scale-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <p className="text-xs text-zinc-400 mt-1">{description}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800">
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex-1 px-4 py-3 text-sm font-bold transition-colors ${
              activeTab === "upload"
                ? "text-white border-b-2 border-violet-500 bg-zinc-800/50"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Upload size={16} className="inline mr-2" />
            Upload
          </button>
          <button
            onClick={() => setActiveTab("link")}
            className={`flex-1 px-4 py-3 text-sm font-bold transition-colors ${
              activeTab === "link"
                ? "text-white border-b-2 border-violet-500 bg-zinc-800/50"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <LinkIcon size={16} className="inline mr-2" />
            Link
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Preview */}
          {preview && (
            <div className="mb-4">
              <p className="text-xs font-bold text-zinc-400 uppercase mb-2">Preview</p>
              <div className="w-full h-32 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === "upload" && (
            <>
              {preview ? (
                <div className="space-y-3">
                  <button
                    onClick={handleUploadConfirm}
                    disabled={uploadState.isLoading}
                    className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {uploadState.isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        Confirmar Upload
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setPreview("");
                      setSelectedFile(null);
                      setUploadState({ isLoading: false, error: null, isDragging: false });
                    }}
                    disabled={uploadState.isLoading}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors"
                  >
                    Escolher Outra
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    uploadState.isDragging
                      ? "border-violet-500 bg-violet-500/10"
                      : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto mb-3 text-zinc-400" size={32} />
                  <p className="font-bold text-white mb-1">Arraste a imagem aqui</p>
                  <p className="text-xs text-zinc-400 mb-3">ou clique para selecionar</p>
                  <p className="text-xs text-zinc-500">Máx. 5MB • JPEG, PNG, WebP, GIF</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
              )}
            </>
          )}

          {/* Link Tab */}
          {activeTab === "link" && (
            <div className="space-y-3">
              <input
                type="url"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
              />
              <button
                onClick={handleLinkSubmit}
                disabled={uploadState.isLoading || !linkInput.trim()}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {uploadState.isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Validando...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Confirmar
                  </>
                )}
              </button>
            </div>
          )}

          {/* Error State */}
          {uploadState.error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{uploadState.error}</p>
            </div>
          )}

          {/* Loading State */}
          {uploadState.isLoading && activeTab === "upload" && (
            <div className="text-center py-4">
              <Loader2 size={24} className="mx-auto text-violet-500 animate-spin mb-2" />
              <p className="text-sm text-zinc-400">Fazendo upload...</p>
            </div>
          )}
        </div>

        {currentImage && (
          <div className="px-6 pb-4 text-xs text-zinc-500">
            Imagem atual carregada
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
