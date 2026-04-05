import React from 'react';
import { Plus, Check, Star } from 'lucide-react';

export default function ProviderCard({ provider, isAdded, onToggle, loading }) {
  const benefitCount = provider._count?.benefits ?? provider.benefits?.length ?? 0;

  return (
    <div className="card hover:shadow-md transition-all duration-200 group">
      <div className="p-5">
        {/* Category badge */}
        {provider.category && (
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              {provider.category.icon} {provider.category.name}
            </span>
            {benefitCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-indigo-600 font-medium">
                <Star className="w-3 h-3 fill-indigo-600" />
                {benefitCount} beneficios
              </span>
            )}
          </div>
        )}

        {/* Logo + name */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
            {provider.logoUrl ? (
              <img
                src={provider.logoUrl}
                alt={provider.name}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <span
              className="text-indigo-700 font-bold text-lg"
              style={{ display: provider.logoUrl ? 'none' : 'flex' }}
            >
              {provider.name.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{provider.name}</h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
          {provider.description}
        </p>

        {/* Action button */}
        <button
          onClick={() => onToggle && onToggle(provider.id, isAdded)}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            isAdded
              ? 'bg-indigo-50 text-indigo-700 hover:bg-red-50 hover:text-red-600 border border-indigo-200 hover:border-red-200'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isAdded ? (
            <>
              <Check className="w-4 h-4" />
              <span className="group-hover:hidden">Agregado</span>
              <span className="hidden group-hover:inline">Quitar</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Agregar
            </>
          )}
        </button>
      </div>
    </div>
  );
}
