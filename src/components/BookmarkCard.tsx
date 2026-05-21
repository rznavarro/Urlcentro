import React, { useState } from "react";
import { ExternalLink, Copy, Check, Edit2, Trash2, Calendar, Eye } from "lucide-react";
import { motion } from "motion/react";
import { Bookmark, Category } from "../types";
import { getFaviconUrl, getHostname, COLOR_OPTIONS, formatUrl } from "../utils";

interface BookmarkCardProps {
  bookmark: Bookmark;
  category: Category | undefined;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onRegisterClick: (id: string) => void;
}

export default function BookmarkCard({
  bookmark,
  category,
  onEdit,
  onDelete,
  onRegisterClick,
}: BookmarkCardProps) {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const hostname = getHostname(bookmark.url);
  const favicon = getFaviconUrl(bookmark.url);

  // Match category color classes
  const colorMatch = COLOR_OPTIONS.find(
    (c) => c.label.toLowerCase() === category?.color?.toLowerCase()
  ) || COLOR_OPTIONS[COLOR_OPTIONS.length - 1]; // Fallback to Gray

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(bookmark.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("No se pudo copiar", err);
    }
  };

  const handleOpenLink = () => {
    onRegisterClick(bookmark.id);
    window.open(formatUrl(bookmark.url), "_blank", "noopener,noreferrer");
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  // Human-readable date
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
      id={`bookmark-card-${bookmark.id}`}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      onClick={handleOpenLink}
      className="group relative bg-white border border-neutral-100 rounded-2xl p-4 hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:border-neutral-200/80 hover:-translate-y-[2px] transition-all duration-300 cursor-pointer flex flex-col justify-between h-full"
    >
      <div>
        {/* Top bar: Favicon & Category & Quick Actions */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Favicon container */}
            <div className="w-10 h-10 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              {favicon && !imgError ? (
                <img
                  src={favicon}
                  alt={hostname}
                  onError={() => setImgError(true)}
                  className="w-5 h-5 object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-xs font-bold font-mono text-neutral-400 uppercase select-none">
                  {hostname.slice(0, 2)}
                </span>
              )}
            </div>

            {/* Title and Short Title Hostname */}
            <div className="min-w-0">
              <h3 className="font-display font-medium text-neutral-800 text-[15px] leading-tight truncate group-hover:text-indigo-600 transition-colors">
                {bookmark.title}
              </h3>
              <p className="text-[11px] font-mono text-neutral-400 truncate mt-0.5 max-w-[200px]">
                {hostname}
              </p>
            </div>
          </div>

          {/* Action buttons (Shown on hover, always accessible for touch) */}
          <div className="flex items-center gap-1 bg-white md:opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-neutral-100 md:shadow-sm rounded-lg p-0.5 z-10">
            <button
              id={`btn-copy-${bookmark.id}`}
              onClick={handleCopy}
              title="Copiar enlace"
              className={`p-1.5 rounded-md transition-colors ${
                copied
                  ? "text-emerald-600 bg-emerald-50"
                  : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
            <button
              id={`btn-edit-${bookmark.id}`}
              onClick={(e) => handleActionClick(e, () => onEdit(bookmark))}
              title="Editar"
              className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <Edit2 size={14} />
            </button>
            <button
              id={`btn-delete-${bookmark.id}`}
              onClick={(e) => handleActionClick(e, () => onDelete(bookmark.id))}
              title="Eliminar"
              className="p-1.5 rounded-md text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Description */}
        {bookmark.description && (
          <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed mb-4">
            {bookmark.description}
          </p>
        )}
      </div>

      {/* Footer: Category Pill and Metadata */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-dashed border-neutral-100 text-[10px] text-neutral-400">
        {/* Category Badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${colorMatch.bg} ${colorMatch.text} ${colorMatch.border} transition-colors`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${colorMatch.dot}`} />
          {category?.name || "Sin Categoría"}
        </span>

        {/* Stats */}
        <div className="flex items-center gap-2.5">
          {bookmark.clicks > 0 && (
            <span className="flex items-center gap-1 font-mono text-[10px]" title="Visitas registradas">
              <Eye size={11} className="text-neutral-300" />
              {bookmark.clicks}
            </span>
          )}
          <span className="flex items-center gap-1 font-mono hover:text-neutral-500" title="Fecha de adición">
            <Calendar size={11} className="text-neutral-300" />
            {formatDate(bookmark.createdAt)}
          </span>
          {/* External Icon */}
          <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 text-indigo-500 transition-all ml-0.5" />
        </div>
      </div>
    </motion.div>
  );
}
