import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  FolderOpen,
  ArrowUpDown,
  Download,
  Upload,
  Database,
  Grid,
  Check,
  X,
  Sparkles,
  Link2,
  Trash2,
  Briefcase,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ClientProject } from "./types";
import AddBookmarkForm from "./components/AddBookmarkForm";
import BookmarkCard from "./components/BookmarkCard";

// --- CLIENT WORKFLOW INITIAL DATA ---
const DEFAULT_PROJECTS: ClientProject[] = [
  {
    id: "init-1",
    clientName: "Restaurante Bella Italia",
    urlActual: "http://bellaitaliamadrid-antigua.com",
    urlCreada: "https://bella-italia-madrid.vercel.app",
    notes: "Rediseño completo de su sitio web antiguo de Flash a React + Tailwind. Mejoró velocidad y SEO.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
  },
  {
    id: "init-2",
    clientName: "Clínica Dental Sanitas / Dr. Pérez",
    urlActual: undefined, // No tenía sitio previo
    urlCreada: "https://drperez-odontologia.com",
    notes: "Sitio web corporativo inicial de marca propia. Incluye integración con calendario de reservas.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
  },
  {
    id: "init-3",
    clientName: "Estudio de Yoga Lotus",
    urlActual: "https://yogalotus-es.com",
    urlCreada: "https://yoga-lotus-redesign.netlify.app",
    notes: "Proyecto de rediseño web enfocado en dispositivos móviles y pasarela de pago para clases.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day ago
  },
  {
    id: "init-4",
    clientName: "Ferretería El Tornillo",
    urlActual: undefined,
    urlCreada: "https://ferreteria-el-tornillo.vercel.app",
    notes: "Catálogo digital minimalista. Próximamente se convertirá en un e-commerce completo.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
  }
];

export default function App() {
  // --- STATES ---
  const [projects, setProjects] = useState<ClientProject[]>([]);
  
  // Filtering & Sorting
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest"); // "newest" | "oldest" | "alphabetical"

  // UI Modals / Toggles
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ClientProject | null>(null);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [backupText, setBackupText] = useState("");
  const [backupError, setBackupError] = useState("");
  const [backupSuccess, setBackupSuccess] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState({ text: "", type: "" }); // { text, type: "success" | "info" }

  // --- INITIALIZATION ---
  useEffect(() => {
    // Load projects
    const savedProjects = localStorage.getItem("url_organizer_projects");
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (e) {
        setProjects(DEFAULT_PROJECTS);
      }
    } else {
      setProjects(DEFAULT_PROJECTS);
      localStorage.setItem("url_organizer_projects", JSON.stringify(DEFAULT_PROJECTS));
    }
  }, []);

  // Show disappearing feed message
  const triggerFeedback = (text: string, type: string = "success") => {
    setFeedbackMessage({ text, type });
    setTimeout(() => {
      setFeedbackMessage({ text: "", type: "" });
    }, 4000);
  };

  // --- ACTIONS ---
  const handleAddProject = (
    newProject: Omit<ClientProject, "id" | "createdAt">
  ) => {
    const fresh: ClientProject = {
      ...newProject,
      id: `project-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [fresh, ...projects];
    setProjects(updated);
    localStorage.setItem("url_organizer_projects", JSON.stringify(updated));
    triggerFeedback("¡Enlaces guardados exitosamente!");
  };

  const handleUpdateProject = (id: string, updates: Partial<ClientProject>) => {
    const updated = projects.map((p) => {
      if (p.id === id) {
        return { ...p, ...updates };
      }
      return p;
    });

    setProjects(updated);
    localStorage.setItem("url_organizer_projects", JSON.stringify(updated));
    triggerFeedback("¡Enlaces actualizados correctamente!");
  };

  const handleDeleteProject = (id: string) => {
    const confirmed = window.confirm("¿Seguro que deseas eliminar este cliente y sus enlaces?");
    if (!confirmed) return;

    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    localStorage.setItem("url_organizer_projects", JSON.stringify(updated));
    triggerFeedback("Registro de cliente eliminado.", "info");
  };

  // --- IMPORT / EXPORT METHODS ---
  const handleExportData = () => {
    const exportObject = {
      version: 1,
      exportedAt: new Date().toISOString(),
      projects,
    };
    const code = JSON.stringify(exportObject, null, 2);
    setBackupText(code);
    setBackupError("");
    setBackupSuccess("Respaldo listo para descargar. Copia el archivo JSON abajo.");

    // Trigger local download
    try {
      const blob = new Blob([code], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `organizador-urls-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      // Fallback if browser blocks automatic triggering
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
      // Support parsing old bookmarks if any or parse projects directly
      const importedProjects = parsed.projects || parsed.bookmarks;
      
      if (!importedProjects || !Array.isArray(importedProjects)) {
        setBackupError("El JSON no tiene un formato válido (falta lista 'projects').");
        return;
      }

      // Format correctly if old bookmark format
      const formattedProjects: ClientProject[] = importedProjects.map((item: any) => {
        if (item.clientName) return item;
        return {
          id: item.id || `project-${Date.now()}`,
          clientName: item.title || "Cliente Sin Nombre",
          urlActual: undefined,
          urlCreada: item.url,
          notes: item.description || undefined,
          createdAt: item.createdAt || new Date().toISOString(),
        };
      });

      setProjects(formattedProjects);
      localStorage.setItem("url_organizer_projects", JSON.stringify(formattedProjects));

      setBackupText("");
      setBackupSuccess("¡Respaldos importados exitosamente!");
      triggerFeedback("Base de datos de URLs importada.");
      setIsBackupOpen(false);
    } catch (err) {
      setBackupError("Error al analizar JSON. Asegúrate de que el formato sea correcto.");
    }
  };

  // --- FILTERING & SORTING LOGIC ---
  const filteredAndSortedProjects = useMemo(() => {
    // 1. Filter
    let items = projects;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (p) =>
          p.clientName.toLowerCase().includes(q) ||
          (p.urlActual && p.urlActual.toLowerCase().includes(q)) ||
          (p.urlCreada && p.urlCreada.toLowerCase().includes(q)) ||
          (p.notes && p.notes.toLowerCase().includes(q))
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
      if (sortBy === "alphabetical") {
        return a.clientName.localeCompare(b.clientName);
      }
      return 0;
    });
  }, [projects, searchQuery, sortBy]);

  const handleLoadDefaults = () => {
    setProjects(DEFAULT_PROJECTS);
    localStorage.setItem("url_organizer_projects", JSON.stringify(DEFAULT_PROJECTS));
    triggerFeedback("Datos de demostración cargados.");
  };

  const handleClearAll = () => {
    const confirm = window.confirm("¿Seguro que deseas vaciar por completo todo el listado de urls?");
    if (!confirm) return;
    setProjects([]);
    localStorage.setItem("url_organizer_projects", JSON.stringify([]));
    triggerFeedback("Se borró la lista completa.", "info");
  };

  return (
    <div className="min-h-screen bg-neutral-50/70 font-sans text-neutral-800 antialiased selection:bg-indigo-100 selection:text-indigo-900 pb-20">
      
      {/* --- FLOATING FEEDBACK TOAST --- */}
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
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
            )}
            <span>{feedbackMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MINIMAL HEADER --- */}
      <header className="border-b border-neutral-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 rounded-lg bg-neutral-900 text-white font-mono text-[10px] font-semibold tracking-wider flex items-center gap-1">
                <Briefcase size={12} /> CREADOR WEB
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Enlaces Organizados
              </span>
            </div>
            
            <h1 className="text-2xl font-display font-bold text-neutral-900 mt-2 tracking-tight">
              Organizador de URLs de Clientes
            </h1>
            <p className="text-xs text-neutral-450 mt-1 max-w-lg">
              Administra fácilmente las URLs de tus prospectos: Su <strong>Web Actual</strong> (sitio original) y la <strong>Web Creada / Rediseño</strong> que has desarrollado.
            </p>
          </div>

          {/* Core Action buttons in header */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              id="btn-import-export"
              onClick={() => setIsBackupOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Copia de Seguridad"
            >
              <Database size={13} className="text-neutral-400" />
              <span>Respaldo JSON</span>
            </button>
            
            <button
              id="btn-trigger-add"
              onClick={() => {
                setEditingProject(null);
                setIsAddFormOpen(!isAddFormOpen);
              }}
              className="px-4 py-1.5 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
            >
              <Plus size={14} className="stroke-[3]" />
              <span>Agregar Cliente</span>
            </button>
          </div>
        </div>
      </header>

      {/* --- DASHBOARD WRAPPER --- */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">

        {/* --- ADD / EDIT FORM (COLLAPSIBLE) --- */}
        <AnimatePresence>
          {(isAddFormOpen || editingProject) && (
            <motion.div
              id="interactive-form-section"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="mb-8 p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm"
            >
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <span className="p-1 px-2 rounded-lg bg-indigo-50 text-indigo-700 font-medium">
                    <Sparkles size={14} />
                  </span>
                  <h2 className="text-sm font-display font-semibold text-neutral-800">
                    {editingProject ? `Editar Enlaces de ${editingProject.clientName}` : "Almacenar Cliente y Enlaces Web"}
                  </h2>
                </div>
                <button
                  id="btn-close-form"
                  onClick={() => {
                    setIsAddFormOpen(false);
                    setEditingProject(null);
                  }}
                  className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <AddBookmarkForm
                onAdd={handleAddProject}
                onUpdate={handleUpdateProject}
                editingProject={editingProject}
                onCancelEdit={() => setEditingProject(null)}
                onClose={() => setIsAddFormOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- DETAILED FILTER & CLASSIFICATIONS BAR --- */}
        <div className="bg-white border border-neutral-100 rounded-2xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Real-time search query search bar */}
          <div className="relative w-full sm:flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <Search size={15} />
            </span>
            <input
              id="search-input"
              type="text"
              placeholder="Buscar por cliente, web actual, propuesta de rediseño o notas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 text-xs transition-colors"
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

          {/* Quick sort classification toggle */}
          <div className="flex items-center gap-2 select-none shrink-0 w-full sm:w-auto justify-end">
            <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1">
              <ArrowUpDown size={12} /> Ordenar
            </span>
            <div className="relative">
              <select
                id="select-sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer text-neutral-700 pr-8 appearance-none hover:bg-neutral-100/50 transition-colors"
              >
                <option value="newest">Más recientes</option>
                <option value="oldest">Antiguos primero</option>
                <option value="alphabetical">Alfabético (A-Z)</option>
              </select>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none text-neutral-400 font-mono text-[9px]">&#9654;</span>
            </div>
          </div>

        </div>

        {/* --- MAIN CARDS LIST GRID --- */}
        <AnimatePresence mode="popLayout">
          {filteredAndSortedProjects.length > 0 ? (
            <motion.div
              id="projects-grid"
              layout
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5"
            >
              {filteredAndSortedProjects.map((project) => (
                <BookmarkCard
                  key={project.id}
                  project={project}
                  onEdit={(p) => {
                    setEditingProject(p);
                    setIsAddFormOpen(true);
                    window.scrollTo({ top: 100, behavior: "smooth" });
                  }}
                  onDelete={handleDeleteProject}
                />
              ))}
            </motion.div>
          ) : (
            
            /* --- EMPTY LIST STATE --- */
            <motion.div
              id="projects-empty"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white border border-neutral-105 rounded-2xl p-10 text-center max-w-md mx-auto my-8 space-y-4 shadow-sm"
            >
              <div className="w-14 h-14 rounded-2xl bg-neutral-50 text-neutral-450 mx-auto flex items-center justify-center border border-neutral-100">
                <FolderOpen size={24} className="stroke-[1.5]" />
              </div>

              <div>
                <h3 className="font-display font-semibold text-neutral-800 text-base">
                  {searchQuery ? "Sin resultados de búsqueda" : "No hay URLs guardadas aún"}
                </h3>
                <p className="text-xs text-neutral-400 max-w-xs mx-auto mt-1">
                  {searchQuery
                    ? "Prueba a cambiar tu búsqueda o limpia el filtro para ver todos los clientes."
                    : "Comienza a organizar tu flujo de trabajo de diseño web guardando tus primeros clientes."}
                </p>
              </div>

              {searchQuery ? (
                <button
                  id="btn-reset-search"
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-2 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl transition-all cursor-pointer"
                >
                  Limpiar Búsqueda
                </button>
              ) : (
                <div className="flex flex-col gap-2 pt-1.5">
                  <button
                    id="btn-empty-add"
                    onClick={() => {
                      setEditingProject(null);
                      setIsAddFormOpen(true);
                    }}
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={13} className="stroke-[3]" />
                    <span>Agregar Mi Primer Enlace</span>
                  </button>

                  <button
                    id="btn-load-demos"
                    onClick={handleLoadDefaults}
                    className="px-4 py-2 border border-neutral-250 hover:bg-neutral-50 text-neutral-650 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    Cargar Demostración de Proyectos
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- BOTTOM SUMMARY TOOLBAR --- */}
        {projects.length > 0 && (
          <div className="mt-12 pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400 font-mono">
            <div>
              <span>Almacenados: {projects.length} clientes en total</span>
              {searchQuery && (
                <span> | Mostrando {filteredAndSortedProjects.length} resultados de búsqueda</span>
              )}
            </div>
            <button
              id="btn-clear-db"
              onClick={handleClearAll}
              className="text-rose-500 hover:text-rose-700 font-semibold transition-colors cursor-pointer flex items-center gap-1"
            >
              <Trash2 size={12} />
              <span>Vaciar mi organizador</span>
            </button>
          </div>
        )}

      </main>

      {/* --- BACKUP MODAL DATA CENTER --- */}
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
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden z-10 border border-neutral-100"
            >
              <div className="flex items-center justify-between p-5 border-b border-neutral-100 bg-neutral-50/50">
                <div className="flex items-center gap-1.5 text-neutral-850">
                  <Database size={15} className="text-neutral-500" />
                  <h2 className="font-display font-semibold text-neutral-900 text-sm">
                    Respaldar & Importar URLs de Clientes
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

              <div className="p-6 space-y-4">
                <p className="text-[11px] text-neutral-500 leading-normal bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                  No pierdas tus enlaces. Puedes guardar un respaldo físico en tu computadora o importar archivos de configuración previos en un solo clic.
                </p>

                <div className="flex gap-2">
                  <button
                    id="btn-export-payload"
                    type="button"
                    onClick={handleExportData}
                    className="flex-1 py-1.5 px-3 border border-neutral-200 hover:bg-neutral-50 text-neutral-750 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download size={13} /> Descargar archivo .json
                  </button>
                </div>

                <form onSubmit={handleImportData} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Upload size={11} /> Pegar JSON para importar
                    </label>
                    <textarea
                      id="backup-input-textarea"
                      placeholder="Pega el contenido del archivo JSON de respaldo aquí..."
                      value={backupText}
                      onChange={(e) => setBackupText(e.target.value)}
                      rows={4}
                      className="w-full p-2.5 bg-neutral-55 border border-neutral-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 resize-none placeholder:text-neutral-400"
                    />
                  </div>

                  {backupError && (
                    <p className="text-xs text-rose-500 font-medium">{backupError}</p>
                  )}

                  {backupSuccess && (
                    <p className="text-xs text-emerald-600 font-medium">{backupSuccess}</p>
                  )}

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      id="btn-modal-close"
                      type="button"
                      onClick={() => setIsBackupOpen(false)}
                      className="px-3.5 py-1.5 border border-neutral-200 hover:bg-neutral-50 rounded-xl text-xs font-semibold text-neutral-600 transition-colors cursor-pointer"
                    >
                      Cerrar
                    </button>
                    <button
                      id="btn-modal-import"
                      type="submit"
                      disabled={!backupText.trim()}
                      className="px-4 py-1.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      Importar
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
