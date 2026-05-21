import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  SlidersHorizontal,
  FolderOpen,
  ArrowUpDown,
  Download,
  Upload,
  Info,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Database,
  Grid,
  Check,
  X,
  Sparkles,
  Link2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Category, Bookmark } from "./types";
import AddBookmarkForm from "./components/AddBookmarkForm";
import BookmarkCard from "./components/BookmarkCard";
import CategoryManager from "./components/CategoryManager";
import { formatUrl, getHostname, COLOR_OPTIONS, isValidUrl } from "./utils";

// --- INITIAL DEFAULT DATA ---
const DEFAULT_CATEGORIES: Category[] = [
  { id: "uncategorized", name: "Sin Categorizar", color: "Gris" },
  { id: "work", name: "Trabajo", color: "Indigo" },
  { id: "study", name: "Estudios", color: "Cielo" },
  { id: "reading", name: "Lecturas/Blogs", color: "Esmeralda" },
  { id: "tools", name: "Herramientas", color: "Púrpura" },
  { id: "entertainment", name: "Entretenimiento", color: "Ámbar" },
];

const DEFAULT_BOOKMARKS: Bookmark[] = [
  {
    id: "init-1",
    url: "https://wikipedia.org",
    title: "Wikipedia",
    description: "La enciclopedia libre, un compendio del conocimiento humano editable de forma abierta.",
    categoryId: "study",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    clicks: 12,
  },
  {
    id: "init-2",
    url: "https://github.com",
    title: "GitHub",
    description: "Repositorios de código, colaboración, integraciones CI/CD y despliegue de software open-source y privado.",
    categoryId: "tools",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    clicks: 28,
  },
  {
    id: "init-3",
    url: "https://react.dev",
    title: "React Docs",
    description: "Biblioteca y documentación oficial para construir interfaces de usuario interactivas basadas en componentes.",
    categoryId: "study",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day ago
    clicks: 45,
  },
  {
    id: "init-4",
    url: "https://tailwindcss.com",
    title: "Tailwind CSS Documentation",
    description: "Framework CSS utilitario para estilizar componentes de forma rápida, robusta y con total flexibilidad.",
    categoryId: "tools",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    clicks: 18,
  },
  {
    id: "init-5",
    url: "https://google.com",
    title: "Google Search",
    description: "Motor de búsqueda global para encontrar información, recursos, imágenes y respuestas rápidas.",
    categoryId: "uncategorized",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    clicks: 5,
  }
];

export default function App() {
  // --- STATES ---
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Filtering & Sorting
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest"); // "newest" | "oldest" | "popular" | "alphabetical"

  // UI Modals / Toggles
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [isCategoriesManagerOpen, setIsCategoriesManagerOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [backupText, setBackupText] = useState("");
  const [backupError, setBackupError] = useState("");
  const [backupSuccess, setBackupSuccess] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState({ text: "", type: "" }); // { text, type: "success" | "info" }

  // --- INITIALIZATION ---
  useEffect(() => {
    // Load categories
    const savedCategories = localStorage.getItem("url_organizer_categories");
    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories));
      } catch (e) {
        setCategories(DEFAULT_CATEGORIES);
      }
    } else {
      setCategories(DEFAULT_CATEGORIES);
      localStorage.setItem("url_organizer_categories", JSON.stringify(DEFAULT_CATEGORIES));
    }

    // Load bookmarks
    const savedBookmarks = localStorage.getItem("url_organizer_bookmarks");
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (e) {
        setBookmarks(DEFAULT_BOOKMARKS);
      }
    } else {
      setBookmarks(DEFAULT_BOOKMARKS);
      localStorage.setItem("url_organizer_bookmarks", JSON.stringify(DEFAULT_BOOKMARKS));
    }
  }, []);

  // Show disappearing feed message
  const triggerFeedback = (text: string, type: string = "success") => {
    setFeedbackMessage({ text, type });
    setTimeout(() => {
      setFeedbackMessage({ text: "", type: "" });
    }, 4000);
  };

  // --- BOOKMARKS ACTIONS ---
  const handleAddBookmark = (
    newBookmark: Omit<Bookmark, "id" | "createdAt" | "clicks">
  ) => {
    const fresh: Bookmark = {
      ...newBookmark,
      id: `bookmark-${Date.now()}`,
      createdAt: new Date().toISOString(),
      clicks: 0,
    };

    const updated = [fresh, ...bookmarks];
    setBookmarks(updated);
    localStorage.setItem("url_organizer_bookmarks", JSON.stringify(updated));
    triggerFeedback("¡Enlace guardado exitosamente!");
  };

  const handleUpdateBookmark = (id: string, updates: Partial<Bookmark>) => {
    const updated = bookmarks.map((b) => {
      if (b.id === id) {
        return { ...b, ...updates };
      }
      return b;
    });

    setBookmarks(updated);
    localStorage.setItem("url_organizer_bookmarks", JSON.stringify(updated));
    triggerFeedback("¡Enlace actualizado correctamente!");
  };

  const handleDeleteBookmark = (id: string) => {
    const confirmed = window.confirm("¿Seguro que deseas eliminar este enlace?");
    if (!confirmed) return;

    const updated = bookmarks.filter((b) => b.id !== id);
    setBookmarks(updated);
    localStorage.setItem("url_organizer_bookmarks", JSON.stringify(updated));
    triggerFeedback("Enlace eliminado.", "info");
  };

  const handleRegisterClick = (id: string) => {
    const updated = bookmarks.map((b) => {
      if (b.id === id) {
        return { ...b, clicks: b.clicks + 1 };
      }
      return b;
    });
    setBookmarks(updated);
    localStorage.setItem("url_organizer_bookmarks", JSON.stringify(updated));
  };

  // --- CATEGORIES ACTIONS ---
  const handleCreateCategory = (name: string, color: string) => {
    const newCat: Category = {
      id: `category-${Date.now()}`,
      name,
      color,
    };

    const updated = [...categories, newCat];
    setCategories(updated);
    localStorage.setItem("url_organizer_categories", JSON.stringify(updated));
    triggerFeedback(`Categoría "${name}" creada.`);
  };

  const handleDeleteCategory = (id: string) => {
    // Re-route links containing this category inside `uncategorized`
    const updatedBookmarks = bookmarks.map((b) => {
      if (b.categoryId === id) {
        return { ...b, categoryId: "uncategorized" };
      }
      return b;
    });

    const updatedCategories = categories.filter((c) => c.id !== id);

    setBookmarks(updatedBookmarks);
    setCategories(updatedCategories);
    
    localStorage.setItem("url_organizer_bookmarks", JSON.stringify(updatedBookmarks));
    localStorage.setItem("url_organizer_categories", JSON.stringify(updatedCategories));

    // Reset selection if deleted category was selected
    if (selectedCategory === id) {
      setSelectedCategory("all");
    }

    triggerFeedback("Categoría eliminada. Los enlaces se movieron a Sin Categorizar.", "info");
  };

  // Maps categoryId to count of bookmarks for visual feedback
  const bookmarksCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    bookmarks.forEach((b) => {
      map[b.categoryId] = (map[b.categoryId] || 0) + 1;
    });
    return map;
  }, [bookmarks]);

  // --- IMPORT / EXPORT CODES ---
  const handleExportData = () => {
    const exportObject = {
      version: 1,
      exportedAt: new Date().toISOString(),
      bookmarks,
      categories,
    };
    const code = JSON.stringify(exportObject, null, 2);
    setBackupText(code);
    setBackupError("");
    setBackupSuccess("Listo: Se generó el archivo JSON abajo. Cópialo o descárgalo.");

    // Trigger local download
    try {
      const blob = new Blob([code], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `url-organizer-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      // Fallback
    }
  };

  const handleImportData = (e: React.FormEvent) => {
    e.preventDefault();
    setBackupError("");
    setBackupSuccess("");

    if (!backupText.trim()) {
      setBackupError("Por favor, introduce el JSON de respaldo válido.");
      return;
    }

    try {
      const parsed = JSON.parse(backupText);
      if (!parsed.bookmarks || !Array.isArray(parsed.bookmarks)) {
        setBackupError("El JSON no tiene un formato válido (falta lista 'bookmarks').");
        return;
      }

      const importedBookmarks = parsed.bookmarks;
      const importedCategories = parsed.categories || DEFAULT_CATEGORIES;

      setBookmarks(importedBookmarks);
      setCategories(importedCategories);

      localStorage.setItem("url_organizer_bookmarks", JSON.stringify(importedBookmarks));
      localStorage.setItem("url_organizer_categories", JSON.stringify(importedCategories));

      setBackupText("");
      setBackupSuccess("¡Respaldos importados exitosamente! La página se ha actualizado.");
      triggerFeedback("Base de datos importada correctamente.");
      setIsBackupOpen(false);
    } catch (err) {
      setBackupError("Error al analizar JSON. Asegúrate de que el formato sea correcto.");
    }
  };

  // --- FILTERING & SORTING LOGIC ---
  const filteredAndSortedBookmarks = useMemo(() => {
    // 1. Filter
    let items = bookmarks;

    if (selectedCategory !== "all") {
      items = items.filter((b) => b.categoryId === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.url.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q)
      );
    }

    // 2. Sort
    return [...items].sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "popular") {
        return b.clicks - a.clicks;
      }
      if (sortBy === "alphabetical") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [bookmarks, selectedCategory, searchQuery, sortBy]);

  // Load a set of fresh initial examples if list is empty
  const handleLoadExamples = () => {
    setBookmarks(DEFAULT_BOOKMARKS);
    setCategories(DEFAULT_CATEGORIES);
    localStorage.setItem("url_organizer_bookmarks", JSON.stringify(DEFAULT_BOOKMARKS));
    localStorage.setItem("url_organizer_categories", JSON.stringify(DEFAULT_CATEGORIES));
    triggerFeedback("Ejemplos cargados.");
  };

  const handleClearAllBookmarks = () => {
    const confirm = window.confirm("¿Seguro que quieres borrar absolutamente todos tus enlaces?");
    if (!confirm) return;
    setBookmarks([]);
    localStorage.setItem("url_organizer_bookmarks", JSON.stringify([]));
    triggerFeedback("Se borraron todos los enlaces.", "info");
  };

  return (
    <div className="min-h-screen bg-neutral-50/70 font-sans text-neutral-800 antialiased selection:bg-indigo-100 selection:text-indigo-900 pb-20">
      {/* --- FEEDBACK BANNER --- */}
      <AnimatePresence>
        {feedbackMessage.text && (
          <motion.div
            id="feedback-toast"
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white text-xs py-2 px-4 rounded-xl shadow-lg flex items-center gap-2 font-medium"
          >
            {feedbackMessage.type === "success" ? (
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
            ) : (
              <span className="w-1.5 h-1.5 bg-sky-400 rounded-full" />
            )}
            <span>{feedbackMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN HERO HEADER --- */}
      <header className="border-b border-neutral-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 rounded-xl bg-neutral-900 text-white font-mono text-xs font-semibold tracking-wider flex items-center gap-1">
                <Link2 size={13} /> ENLACE
              </span>
              <span className="text-xs font-mono text-neutral-400 font-medium">v1.2</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-neutral-900 mt-2 tracking-tight">
              Organizador de URLs
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Guarda, clasifica y gestiona tus enlaces favoritos en un espacio minimalista.
            </p>
          </div>

          {/* Quick Actions Header Toolbar */}
          <div className="flex items-center gap-2.5 self-start sm:self-center">
            <button
              id="btn-import-export"
              onClick={() => setIsBackupOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Copia de Seguridad"
            >
              <Database size={13} className="text-neutral-400" />
              <span>Respaldo</span>
            </button>
            
            <button
              id="btn-manage-cats"
              onClick={() => setIsCategoriesManagerOpen(true)}
              className="px-3.5 py-1.5 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Categorías</span>
            </button>

            <button
              id="btn-trigger-add"
              onClick={() => {
                setEditingBookmark(null);
                setIsAddFormOpen(!isAddFormOpen);
              }}
              className="px-4 py-1.5 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors flex items-center gap-1 cursor-pointer shadow-sm shadow-neutral-900/10"
            >
              <Plus size={14} className="stroke-[3]" />
              <span>Nuevo Enlace</span>
            </button>
          </div>
        </div>
      </header>

      {/* --- DASHBOARD WRAPPER --- */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        
        {/* --- ADD / EDIT FORM (COLLAPSIBLE SIDE OR ROW) --- */}
        <AnimatePresence>
          {(isAddFormOpen || editingBookmark) && (
            <motion.div
              id="interactive-form-section"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="mb-8 p-6 bg-white border border-neutral-200/80 rounded-2xl shadow-sm"
            >
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <span className="p-1 px-2 rounded-lg bg-indigo-50 text-indigo-700 font-medium">
                    <Sparkles size={14} />
                  </span>
                  <h2 className="text-sm font-display font-semibold text-neutral-800">
                    {editingBookmark ? "Editar Enlace Guardado" : "Almacenar Nuevo Sitio Web"}
                  </h2>
                </div>
                <button
                  id="btn-close-form"
                  onClick={() => {
                    setIsAddFormOpen(false);
                    setEditingBookmark(null);
                  }}
                  className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <AddBookmarkForm
                categories={categories}
                onAdd={handleAddBookmark}
                onUpdate={handleUpdateBookmark}
                editingBookmark={editingBookmark}
                onCancelEdit={() => setEditingBookmark(null)}
                onClose={() => setIsAddFormOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- FILTERS BAR (Search, sorting, categorizations) --- */}
        <div className="bg-white border border-neutral-100 rounded-2xl p-4 mb-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <Search size={15} />
              </span>
              <input
                id="search-input"
                type="text"
                placeholder="Buscar por título, palabra clave o dirección..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 bg-neutral-50 border border-neutral-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-neutral-300 text-xs transition-colors font-sans text-neutral-800 placeholder:text-neutral-450"
              />
              {searchQuery && (
                <button
                  id="btn-clear-search"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sorting trigger */}
            <div className="flex items-center gap-2 select-none self-end md:self-auto shrink-0">
              <span className="text-[11px] font-medium text-neutral-400 flex items-center gap-1">
                <ArrowUpDown size={12} /> Ordenar por
              </span>
              <div className="relative">
                <select
                  id="select-sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none cursor-pointer text-neutral-700 pr-8 appearance-none hover:bg-neutral-100/50 transition-colors"
                >
                  <option value="newest">Más recientes</option>
                  <option value="oldest">Antiguos primero</option>
                  <option value="popular">Más visitados ★</option>
                  <option value="alphabetical">Alfabético (A-Z)</option>
                </select>
                <ChevronRight size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none text-neutral-400" />
              </div>
            </div>

          </div>

          {/* Categories Tab Pill Filter */}
          <div className="border-t border-neutral-50 pt-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1 select-none">
                <Grid size={11} /> Filtrar Categoría:
              </span>
            </div>
            
            {/* Scrollable category list */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
              <button
                id="btn-cat-filter-all"
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-neutral-900 text-white shadow-sm"
                    : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                Todos ({bookmarks.length})
              </button>
              
              {categories.map((cat) => {
                const count = bookmarksCountMap[cat.id] || 0;
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    id={`btn-cat-filter-${cat.id}`}
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/10"
                        : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? "bg-white/20 text-white" : "bg-neutral-200/60 text-neutral-500"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- BOOKMARKS CONTAINER GRID --- */}
        <AnimatePresence mode="popLayout">
          {filteredAndSortedBookmarks.length > 0 ? (
            <motion.div
              id="bookmarks-grid-container"
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filteredAndSortedBookmarks.map((bookmark) => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  category={categories.find((c) => c.id === bookmark.categoryId)}
                  onEdit={(b) => {
                    setEditingBookmark(b);
                    window.scrollTo({ top: 120, behavior: "smooth" });
                  }}
                  onDelete={handleDeleteBookmark}
                  onRegisterClick={handleRegisterClick}
                />
              ))}
            </motion.div>
          ) : (
            /* --- EMPTY STATE --- */
            <motion.div
              id="bookmarks-empty-state"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white border border-neutral-100 rounded-3xl p-12 text-center max-w-xl mx-auto my-10 space-y-5 shadow-sm"
            >
              <div className="w-16 h-16 rounded-2xl bg-neutral-50 text-neutral-400 mx-auto flex items-center justify-center border border-neutral-100">
                <FolderOpen size={28} className="stroke-[1.5]" />
              </div>

              <div>
                <h3 className="font-display font-semibold text-neutral-800 text-lg">
                  {searchQuery || selectedCategory !== "all"
                    ? "Sin coincidencias encontradas"
                    : "Comienza a guardar tus URLs"}
                </h3>
                <p className="text-sm text-neutral-400 max-w-sm mx-auto mt-1.5">
                  {searchQuery || selectedCategory !== "all"
                    ? "Intenta buscar usando otras palabras clave o cambia el filtro de categoría seleccionado arriba."
                    : "Tu organizador está listo. Almacena direcciones web útiles para tenerlas siempre bien clasificadas y accesibles."}
                </p>
              </div>

              {searchQuery || selectedCategory !== "all" ? (
                <div className="flex justify-center gap-2">
                  <button
                    id="btn-empty-reset"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                    className="px-4 py-2 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl transition-all cursor-pointer"
                  >
                    Limpiar Filtros
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    id="btn-empty-add"
                    onClick={() => {
                      setEditingBookmark(null);
                      setIsAddFormOpen(true);
                    }}
                    className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} className="stroke-[3]" />
                    <span>Agregar Mi Primer Enlace</span>
                  </button>

                  <button
                    id="btn-load-defaults"
                    onClick={handleLoadExamples}
                    className="px-5 py-2.5 border border-neutral-200 hover:bg-neutral-50 text-neutral-600 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Cargar Demostración</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- EXTRAS TOOLBAR (Bottom stats & reset option) --- */}
        {bookmarks.length > 0 && (
          <div className="mt-12 pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400 font-mono">
            <div>
              <span>Almacenados: {bookmarks.length} enlaces en total</span>
              {selectedCategory !== "all" && (
                <span> | Mostrando {filteredAndSortedBookmarks.length} de esta categoría</span>
              )}
            </div>
            <button
              id="btn-clear-database"
              onClick={handleClearAllBookmarks}
              className="text-rose-500 hover:text-rose-700 font-medium transition-colors cursor-pointer"
            >
              [!] Vaciar base de datos local
            </button>
          </div>
        )}
      </main>

      {/* --- CATEGORIES MANAGER DIALOG MODAL --- */}
      <AnimatePresence>
        {isCategoriesManagerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCategoriesManagerOpen(false)}
              className="absolute inset-0 bg-neutral-900/40 backdrop-blur-[2px]"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden z-10 border border-neutral-100"
            >
              <div className="flex items-center justify-between p-5 border-b border-neutral-100 bg-neutral-50/50">
                <h2 className="font-display font-bold text-neutral-900 text-base">
                  Gestionar Categorías
                </h2>
                <button
                  id="btn-close-cats"
                  onClick={() => setIsCategoriesManagerOpen(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6">
                <CategoryManager
                  categories={categories}
                  onCreateCategory={handleCreateCategory}
                  onDeleteCategory={handleDeleteCategory}
                  bookmarksCountMap={bookmarksCountMap}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- BACKUP AND JSON DATA FEED DIALOG MODAL --- */}
      <AnimatePresence>
        {isBackupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBackupOpen(false)}
              className="absolute inset-0 bg-neutral-900/40 backdrop-blur-[2px]"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden z-10 border border-neutral-100"
            >
              <div className="flex items-center justify-between p-5 border-b border-neutral-100 bg-neutral-50/50">
                <div className="flex items-center gap-1.5 text-neutral-850">
                  <Database size={16} className="text-neutral-500" />
                  <h2 className="font-display font-bold text-neutral-900 text-base">
                    Importar / Exportar Datos
                  </h2>
                </div>
                <button
                  id="btn-close-backup"
                  onClick={() => setIsBackupOpen(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="text-xs text-neutral-500 leading-normal bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                  <p>
                    Puedes exportar tus URLs guardadas y categorías personalizadas como un archivo JSON de respaldo para guardarlo en tu computadora o importarlo de vuelta más tarde.
                  </p>
                </div>

                {/* Import / Export Controls */}
                <div className="flex gap-2.5">
                  <button
                    id="btn-export-data"
                    type="button"
                    onClick={handleExportData}
                    className="flex-1 py-2 px-4 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download size={14} /> Exportar y Descargar JSON
                  </button>
                </div>

                <form onSubmit={handleImportData} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Upload size={12} /> Pegar JSON para importar
                    </label>
                    <textarea
                      id="backup-input-textarea"
                      placeholder="Pega el contenido del archivo JSON de respaldo aquí..."
                      value={backupText}
                      onChange={(e) => setBackupText(e.target.value)}
                      rows={5}
                      className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none placeholder:text-neutral-400"
                    />
                  </div>

                  {backupError && (
                    <p className="text-xs text-rose-500 font-medium">
                      {backupError}
                    </p>
                  )}

                  {backupSuccess && (
                    <p className="text-xs text-emerald-600 font-medium">
                      {backupSuccess}
                    </p>
                  )}

                  <div className="flex gap-2 pt-2 justify-end">
                    <button
                      id="btn-close-backup-secondary"
                      type="button"
                      onClick={() => setIsBackupOpen(false)}
                      className="px-4 py-2 border border-neutral-200 hover:bg-neutral-50 rounded-xl text-xs font-semibold text-neutral-600 transition-colors cursor-pointer"
                    >
                      Cerrar
                    </button>
                    <button
                      id="btn-confirm-import"
                      type="submit"
                      disabled={!backupText.trim()}
                      className="px-5 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      Procesar e Importar
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
