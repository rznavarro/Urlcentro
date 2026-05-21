import React, { useState } from "react";
import { ExternalLink, Copy, Check, Edit2, Trash2, Calendar, Globe, ArrowRight, CornerDownRight, FileText } from "lucide-react";
import { motion } from "motion/react";
import { ClientProject } from "../types";
import { getFaviconUrl, getHostname, formatUrl } from "../utils";

interface BookmarkCardProps {
  project: ClientProject;
  onEdit: (project: ClientProject) => void;
  onDelete: (id: string) => void;
}

export default function BookmarkCard({
  project,
  onEdit,
  onDelete,
}: BookmarkCardProps) {
  const [copiedActual, setCopiedActual] = useState(false);
  const [copiedCreada, setCopiedCreada] = useState(false);

  const handleCopy = async (e: React.MouseEvent, url: string, setCopied: (v: boolean) => void) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("No se pudo copiar", err);
    }
  };

  const handleOpenLink = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(formatUrl(url), "_blank", "noopener,noreferrer");
  };

  // Human-readable date helper
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <motion.div
      id={`project-card-${project.id}`}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white border border-neutral-100 rounded-2xl p-5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.02)] hover:border-neutral-200/90 hover:-translate-y-[2px] transition-all duration-300 flex flex-col justify-between h-full"
    >
      <div>
        {/* Card Header: Client Name & Quick Actions */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-neutral-450 tracking-widest font-mono">
              Cliente / Prospecto
            </span>
            <h3 className="font-display font-semibold text-neutral-900 text-lg leading-snug truncate group-hover:text-indigo-600 transition-colors">
              {project.clientName}
            </h3>
          </div>

          {/* Edit/Delete Actions Buttons */}
          <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-neutral-50/50 rounded-lg p-0.5 border border-neutral-100">
            <button
              id={`btn-edit-${project.id}`}
              onClick={(e) => { e.stopPropagation(); onEdit(project); }}
              title="Editar registro"
              className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
            >
              <Edit2 size={13} />
            </button>
            <button
              id={`btn-delete-${project.id}`}
              onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
              title="Eliminar"
              className="p-1.5 rounded-md text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* --- URLS LIST WORKFLOW (1. ACTUAL WEB, 2. CREATED WEB/REDESIGN) --- */}
        <div className="space-y-3 mb-4">
          
          {/* 1. Web Actual (Old Website) */}
          <div className="rounded-xl border border-neutral-100/75 p-3 bg-neutral-50/20">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[9px] font-bold text-neutral-450 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-350" />
                1. Web Actual de la Persona
              </span>
              {project.urlActual && (
                <div className="flex items-center gap-1.5">
                  <button
                    id={`btn-copy-actual-${project.id}`}
                    onClick={(e) => handleCopy(e, project.urlActual!, setCopiedActual)}
                    className="text-[10px] text-neutral-400 hover:text-neutral-700 font-mono transition-colors"
                    title="Copiar link"
                  >
                    {copiedActual ? "copiado!" : "copiar"}
                  </button>
                </div>
              )}
            </div>

            {project.urlActual ? (
              <div 
                onClick={(e) => handleOpenLink(e, project.urlActual!)}
                className="flex items-center justify-between text-xs font-mono text-neutral-600 hover:text-indigo-600 transition-colors cursor-pointer truncate pr-1"
              >
                <span className="truncate italic">{getHostname(project.urlActual)}</span>
                <ExternalLink size={11} className="shrink-0 text-neutral-400 ml-1.5" />
              </div>
            ) : (
              <span className="text-xs text-neutral-400 italic">No tenía página web previa</span>
            )}
          </div>

          {/* 2. Web Creada & Nueva Proposal / Redesign */}
          <div className="rounded-xl border border-indigo-100/50 p-3 bg-indigo-50/20">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[9px] font-bold text-indigo-600/90 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                {project.urlActual ? "2. Propuesta / Rediseño Web" : "2. Nueva Web para Persona"}
              </span>
              {project.urlCreada && (
                <div className="flex items-center gap-1.5">
                  <button
                    id={`btn-copy-creada-${project.id}`}
                    onClick={(e) => handleCopy(e, project.urlCreada!, setCopiedCreada)}
                    className="text-[10px] text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
                    title="Copiar link"
                  >
                    {copiedCreada ? "¡copiado!" : "copiar"}
                  </button>
                </div>
              )}
            </div>

            {project.urlCreada ? (
              <div 
                onClick={(e) => handleOpenLink(e, project.urlCreada!)}
                className="flex items-center justify-between text-xs font-mono font-medium text-neutral-800 hover:text-indigo-700 transition-colors cursor-pointer truncate pr-1"
              >
                <span className="truncate underline decoration-dotted decoration-indigo-300 hover:decoration-indigo-600">{getHostname(project.urlCreada)}</span>
                <span className="flex items-center gap-1 shrink-0 text-indigo-500 font-sans text-[10px] font-semibold bg-indigo-50/80 px-1.5 py-0.5 rounded-md ml-2 group-hover:bg-indigo-100/70 transition-all">
                  ir <ExternalLink size={10} />
                </span>
              </div>
            ) : (
              <span className="text-xs text-neutral-400 italic">No agregada aún</span>
            )}
          </div>

        </div>

        {/* Notes display */}
        {project.notes && (
          <div className="text-xs text-neutral-500 leading-relaxed pt-2 border-t border-neutral-50 flex items-start gap-1 pb-2">
            <FileText size={12} className="text-neutral-400 shrink-0 mt-0.5 mr-1" />
            <p className="line-clamp-2 italic">{project.notes}</p>
          </div>
        )}
      </div>

      {/* Card Footer: Metadata (Fecha) */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-dashed border-neutral-100 text-[10px] text-neutral-400">
        <span className="flex items-center gap-1 font-mono">
          Almacenado: {formatDate(project.createdAt)}
        </span>
      </div>
    </motion.div>
  );
}
