import React, { useState, useEffect } from "react";
import { Plus, Check, X, Link, Type, FileText, ChevronDown, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Category, Bookmark } from "../types";
import { formatUrl, getHostname, isValidUrl } from "../utils";

interface AddBookmarkFormProps {
  categories: Category[];
  onAdd: (bookmark: Omit<Bookmark, "id" | "createdAt" | "clicks">) => void;
  onUpdate?: (id: string, updates: Partial<Bookmark>) => void;
  editingBookmark: Bookmark | null;
  onCancelEdit?: () => void;
  onClose?: () => void;
}

export default function AddBookmarkForm({
  categories,
  onAdd,
  onUpdate,
  editingBookmark,
  onCancelEdit,
  onClose,
}: AddBookmarkFormProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState("");
  const [showOptional, setShowOptional] = useState(false);

  // Load editing bookmark details when set
  useEffect(() => {
    if (editingBookmark) {
      setUrl(editingBookmark.url);
      setTitle(editingBookmark.title);
      setDescription(editingBookmark.description);
      setCategoryId(editingBookmark.categoryId);
      setShowOptional(true);
      setError("");
    } else {
      setUrl("");
      setTitle("");
      setDescription("");
      setCategoryId(categories[0]?.id || "uncategorized");
      setShowOptional(false);
      setError("");
    }
  }, [editingBookmark, categories]);

  // Handle auto-population of Title on URL blur or paste helper
  const handleUrlBlur = () => {
    if (!title && url && isValidUrl(url)) {
      const generated = getHostname(url);
      // Capitalize first letter and replace common parts
      const prettyTitle = generated
        .split(".")[0]
        .replace(/^\w/, (c) => c.toUpperCase());
      setTitle(prettyTitle);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!url.trim()) {
      setError("Por favor, ingresa una dirección URL.");
      return;
    }

    if (!isValidUrl(url)) {
      setError("La URL ingresada no es válida (por ejemplo, google.com).");
      return;
    }

    const finalUrl = formatUrl(url);
    const finalTitle = title.trim() || getHostname(url);

    if (editingBookmark && onUpdate) {
      onUpdate(editingBookmark.id, {
        url: finalUrl,
        title: finalTitle,
        description: description.trim(),
        categoryId,
      });
      if (onCancelEdit) onCancelEdit();
    } else {
      onAdd({
        url: finalUrl,
        title: finalTitle,
        description: description.trim(),
        categoryId,
      });
      // Reset form
      setUrl("");
      setTitle("");
      setDescription("");
      setCategoryId(categories[0]?.id || "uncategorized");
      setShowOptional(false);
    }

    if (onClose) {
      onClose();
    }
  };

  return (
    <form id="add-bookmark-form" onSubmit={handleSubmit} className="space-y-4">
      {/* Input URL */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wider">
          Dirección URL *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            <Link size={16} />
          </div>
          <input
            id="input-url"
            type="text"
            placeholder="ej. github.com o https://react.dev"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={handleUrlBlur}
            className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all placeholder:text-neutral-400 font-sans"
            autoFocus={!editingBookmark}
          />
        </div>
        {error && (
          <p id="url-error" className="mt-1 text-xs text-rose-500 font-medium">
            {error}
          </p>
        )}
      </div>

      {/* Input Title */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Título / Nombre
          </label>
          {!title && url && isValidUrl(url) && (
            <button
              id="btn-auto-title"
              type="button"
              onClick={() => {
                const generated = getHostname(url);
                const prettyTitle = generated
                  .split(".")[0]
                  .replace(/^\w/, (c) => c.toUpperCase());
                setTitle(prettyTitle);
              }}
              className="text-[10px] text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 cursor-pointer"
            >
              <Sparkles size={10} /> Auto-completar
            </button>
          )}
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            <Type size={16} />
          </div>
          <input
            id="input-title"
            type="text"
            placeholder={url ? getHostname(url) : "ej. Wikipedia, React Docs"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all placeholder:text-neutral-400"
          />
        </div>
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wider">
          Categoría
        </label>
        <div className="relative">
          <select
            id="select-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm appearance-none cursor-pointer text-neutral-800 font-sans"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-neutral-400">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* Toggle Optional Description */}
      {!showOptional && (
        <button
          id="btn-show-description"
          type="button"
          onClick={() => setShowOptional(true)}
          className="text-xs text-neutral-500 hover:text-neutral-800 font-medium flex items-center gap-1 mt-1 cursor-pointer"
        >
          <Plus size={14} /> Añadir descripción / nota opcional
        </button>
      )}

      {/* Optional Description */}
      <AnimatePresence>
        {showOptional && (
          <motion.div
            id="optional-description-container"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden space-y-1.5"
          >
            <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Nota / Descripción
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 text-neutral-400">
                <FileText size={16} />
              </div>
              <textarea
                id="input-description"
                placeholder="Añade algún comentario o detalle sobre este sitio..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all placeholder:text-neutral-400 resize-none"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          id="btn-submit-bookmark"
          type="submit"
          className="flex-1 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          {editingBookmark ? (
            <>
              <Check size={16} /> Guardar Cambios
            </>
          ) : (
            <>
              <Plus size={16} /> Agregar Enlace
            </>
          )}
        </button>
        {(editingBookmark || onClose) && (
          <button
            id="btn-cancel-bookmark"
            type="button"
            onClick={() => {
              if (editingBookmark && onCancelEdit) onCancelEdit();
              if (onClose) onClose();
            }}
            className="px-4 py-2.5 border border-neutral-200 hover:bg-neutral-50 rounded-xl text-sm font-medium text-neutral-600 transition-all flex items-center gap-1 cursor-pointer"
          >
            {editingBookmark ? "Cancelar" : "Cerrar"}
          </button>
        )}
      </div>
    </form>
  );
}
