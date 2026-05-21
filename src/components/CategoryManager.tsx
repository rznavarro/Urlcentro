import React, { useState } from "react";
import { Plus, Tag, Trash2, Check, AlertCircle } from "lucide-react";
import { Category } from "../types";
import { COLOR_OPTIONS } from "../utils";

interface CategoryManagerProps {
  categories: Category[];
  onCreateCategory: (name: string, colorClass: string) => void;
  onDeleteCategory: (id: string) => void;
  bookmarksCountMap: Record<string, number>; // Maps categoryId -> count of items
}

export default function CategoryManager({
  categories,
  onCreateCategory,
  onDeleteCategory,
  bookmarksCountMap,
}: CategoryManagerProps) {
  const [newCatName, setNewCatName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].label);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = newCatName.trim();
    if (!trimmed) {
      setError("Por favor, ingresa un nombre para la categoría.");
      return;
    }

    if (trimmed.length > 20) {
      setError("El nombre debe tener menos de 20 caracteres.");
      return;
    }

    // Prevent duplicate category names
    if (
      categories.some(
        (cat) => cat.name.toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      setError("Ya existe una categoría con ese nombre.");
      return;
    }

    onCreateCategory(trimmed, selectedColor);
    setNewCatName("");
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* List of existing categories */}
      <div>
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
          Categorías Existentes ({categories.length})
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {categories.map((cat) => {
            const colorOption = COLOR_OPTIONS.find(
              (c) => c.label.toLowerCase() === cat.color?.toLowerCase()
            ) || COLOR_OPTIONS[COLOR_OPTIONS.length - 1];
            
            const count = bookmarksCountMap[cat.id] || 0;
            const isUncategorized = cat.id === "uncategorized";

            return (
              <div
                key={cat.id}
                className="flex items-center justify-between p-2 rounded-xl border border-neutral-100 bg-neutral-50/50 text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorOption.bg} ${colorOption.text} ${colorOption.border}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${colorOption.dot}`} />
                    {cat.name}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    ({count} {count === 1 ? "enlace" : "enlaces"})
                  </span>
                </div>

                {!isUncategorized && (
                  <button
                    id={`btn-del-cat-${cat.id}`}
                    type="button"
                    onClick={() => onDeleteCategory(cat.id)}
                    className="p-1 px-2 text-xs text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
                    title="Eliminar categoría"
                  >
                    <Trash2 size={12} />
                    <span>Eliminar</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Creación de categoría */}
      <div className="border-t border-neutral-100 pt-5">
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Tag size={12} /> Crear Nueva Categoría
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-neutral-500 mb-1">
              Nombre de la categoría
            </label>
            <input
              id="input-cat-name"
              type="text"
              placeholder="Ej. Recetas, Inspiración, Deportes"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all text-neutral-800"
            />
            {error && (
              <p className="mt-1 text-xs text-rose-500 font-medium">
                {error}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-500 mb-2">
              Seleccionar Color
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {COLOR_OPTIONS.map((color) => (
                <button
                  id={`btn-color-${color.label}`}
                  key={color.label}
                  type="button"
                  onClick={() => setSelectedColor(color.label)}
                  className={`p-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    selectedColor === color.label
                      ? `${color.bg} ${color.text} ${color.border} ring-2 ring-indigo-500/10 scale-[1.03]`
                      : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${color.dot} shrink-0`} />
                  <span className="text-[10px] truncate max-w-full">
                    {color.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            id="btn-cat-submit"
            type="submit"
            className="w-full py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/10 cursor-pointer"
          >
            <Plus size={15} /> Crear Categoría
          </button>
        </form>
      </div>

      <div className="flex items-start gap-2 bg-amber-50/50 border border-amber-100 rounded-xl p-3 text-amber-800">
        <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-600" />
        <p className="text-[11px] leading-normal font-sans">
          Si eliminas una categoría personalizada, todos los enlaces que pertenezcan a ella se moverán de manera automática a la categoría <strong>Sin Categorizar</strong>.
        </p>
      </div>
    </div>
  );
}
