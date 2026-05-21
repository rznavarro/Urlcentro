import React, { useState, useEffect } from "react";
import { Plus, Check, X, Link, Type, FileText, Sparkles, Globe } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ClientProject } from "../types";
import { formatUrl, getHostname, isValidUrl } from "../utils";

interface AddBookmarkFormProps {
  onAdd: (project: Omit<ClientProject, "id" | "createdAt">) => void;
  onUpdate?: (id: string, updates: Partial<ClientProject>) => void;
  editingProject: ClientProject | null;
  onCancelEdit?: () => void;
  onClose?: () => void;
}

export default function AddBookmarkForm({
  onAdd,
  onUpdate,
  editingProject,
  onCancelEdit,
  onClose,
}: AddBookmarkFormProps) {
  const [clientName, setClientName] = useState("");
  const [urlActual, setUrlActual] = useState("");
  const [urlCreada, setUrlCreada] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  // Load editing project details when set
  useEffect(() => {
    if (editingProject) {
      setClientName(editingProject.clientName);
      setUrlActual(editingProject.urlActual || "");
      setUrlCreada(editingProject.urlCreada || "");
      setNotes(editingProject.notes || "");
      setShowNotes(!!editingProject.notes);
      setError("");
    } else {
      setClientName("");
      setUrlActual("");
      setUrlCreada("");
      setNotes("");
      setShowNotes(false);
      setError("");
    }
  }, [editingProject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedName = clientName.trim();
    if (!trimmedName) {
      setError("Por favor, ingresa el nombre del cliente o prospecto.");
      return;
    }

    // Must provide at least one URL
    const trimmedActual = urlActual.trim();
    const trimmedCreada = urlCreada.trim();

    if (!trimmedActual && !trimmedCreada) {
      setError("Por favor, ingresa al menos una URL (Web Actual o Web Creada/Rediseño).");
      return;
    }

    if (trimmedActual && !isValidUrl(trimmedActual)) {
      setError("La URL de la Web Actual no es válida (ej: miweb.com).");
      return;
    }

    if (trimmedCreada && !isValidUrl(trimmedCreada)) {
      setError("La URL de la Web Creada / Rediseño no es válida (ej: nuevaweb.com).");
      return;
    }

    const finalActual = trimmedActual ? formatUrl(trimmedActual) : undefined;
    const finalCreada = trimmedCreada ? formatUrl(trimmedCreada) : undefined;

    if (editingProject && onUpdate) {
      onUpdate(editingProject.id, {
        clientName: trimmedName,
        urlActual: finalActual,
        urlCreada: finalCreada,
        notes: notes.trim() || undefined,
      });
      if (onCancelEdit) onCancelEdit();
    } else {
      onAdd({
        clientName: trimmedName,
        urlActual: finalActual,
        urlCreada: finalCreada,
        notes: notes.trim() || undefined,
      });
      // Reset form
      setClientName("");
      setUrlActual("");
      setUrlCreada("");
      setNotes("");
      setShowNotes(false);
    }

    if (onClose) {
      onClose();
    }
  };

  return (
    <form id="add-project-form" onSubmit={handleSubmit} className="space-y-4">
      {/* Input Client Name */}
      <div>
        <label className="block text-xs font-medium text-neutral-550 mb-1.5 uppercase tracking-wider">
          Nombre del Cliente / Prospecto *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            <Type size={16} />
          </div>
          <input
            id="input-client-name"
            type="text"
            required
            placeholder="ej. Juan Pérez, Restaurante El Cortijo, Dental Group"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-neutral-55 sm:bg-neutral-50/50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 text-sm transition-all placeholder:text-neutral-400 font-sans"
            autoFocus={!editingProject}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input URL Actual */}
        <div>
          <label className="block text-xs font-medium text-neutral-550 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
            1. Web Actual <span className="text-[10px] text-neutral-400 font-normal lowercase">(si ya tiene web)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-300">
              <span className="text-xs font-bold font-mono">old</span>
            </div>
            <input
              id="input-url-actual"
              type="text"
              placeholder="ej. mariorestaurante.com"
              value={urlActual}
              onChange={(e) => setUrlActual(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-55 sm:bg-neutral-50/50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 text-sm transition-all placeholder:text-neutral-400"
            />
          </div>
          <p className="mt-1 text-[10px] text-neutral-400">
            Sitio web inicial del cliente antes de tu trabajo.
          </p>
        </div>

        {/* Input URL Creada / Rediseño */}
        <div>
          <label className="block text-xs font-medium text-neutral-550 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
            2. Web Creada / Rediseño <span className="text-[10px] text-neutral-400 font-normal lowercase">(tu propuesta o nueva web)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
              <Globe size={16} className="text-indigo-500" />
            </div>
            <input
              id="input-url-creada"
              type="text"
              placeholder="ej. mariosrestaurantenuevo.com o dev-link"
              value={urlCreada}
              onChange={(e) => setUrlCreada(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-neutral-55 sm:bg-neutral-50/50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all placeholder:text-neutral-400 font-medium text-indigo-950"
            />
          </div>
          <p className="mt-1 text-[10px] text-neutral-450">
            La URL final, demo o rediseño web que has creado.
          </p>
        </div>
      </div>

      {error && (
        <p id="form-error" className="text-xs text-rose-500 font-medium">
          {error}
        </p>
      )}

      {/* Toggle Optional Notes */}
      {!showNotes && (
        <button
          id="btn-show-notes"
          type="button"
          onClick={() => setShowNotes(true)}
          className="text-xs text-neutral-500 hover:text-neutral-800 font-medium flex items-center gap-1 mt-1 cursor-pointer"
        >
          <Plus size={14} /> Añadir notas sobre el prospecto / cotización (opcional)
        </button>
      )}

      {/* Optional Description / Comments */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            id="notes-container"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden space-y-1.5"
          >
            <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Notas / Detalles del Proyecto
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 text-neutral-400">
                <FileText size={16} />
              </div>
              <textarea
                id="input-notes"
                placeholder="Presupuesto, ideas de rediseño, fecha límite, número de contacto..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 text-sm transition-all placeholder:text-neutral-400 resize-none"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          id="btn-submit-project"
          type="submit"
          className="flex-1 py-2.5 bg-neutral-950 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          {editingProject ? (
            <>
              <Check size={16} /> Guardar Cambios
            </>
          ) : (
            <>
              <Plus size={16} /> Almacenar Enlaces
            </>
          )}
        </button>
        {(editingProject || onClose) && (
          <button
            id="btn-cancel-project"
            type="button"
            onClick={() => {
              if (editingProject && onCancelEdit) onCancelEdit();
              if (onClose) onClose();
            }}
            className="px-4 py-2.5 border border-neutral-200 hover:bg-neutral-50 rounded-xl text-sm font-medium text-neutral-600 transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
