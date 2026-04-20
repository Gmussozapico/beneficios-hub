import React, { useState } from 'react';
import { Tag, Percent, DollarSign, Gift, Zap, ChevronDown, ChevronUp, Calendar, FileText, Star, CheckCircle2, Store, MapPin, ShoppingCart } from 'lucide-react';

const typeConfig = {
  PERCENTAGE: {
    icon: Percent,
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    badgeBg: 'bg-green-100 text-green-700',
    label: 'Descuento',
  },
  AMOUNT: {
    icon: DollarSign,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badgeBg: 'bg-blue-100 text-blue-700',
    label: 'Monto fijo',
  },
  FREEBIE: {
    icon: Gift,
    color: 'text-violet-700',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    badgeBg: 'bg-violet-100 text-violet-700',
    label: 'Regalo',
  },
  SPECIAL: {
    icon: Zap,
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    badgeBg: 'bg-orange-100 text-orange-700',
    label: 'Especial',
  },
};

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function BenefitCard({ benefit, isFavorited, onFavoriteToggle, onMarkUsed }) {
  const [expanded, setExpanded] = useState(false);
  const config = typeConfig[benefit.type] || typeConfig.SPECIAL;
  const Icon = config.icon;

  const handleFavorite = (e) => {
    e.stopPropagation();
    if (onFavoriteToggle) onFavoriteToggle(benefit.id, isFavorited);
  };

  const handleMarkUsed = (e) => {
    e.stopPropagation();
    if (onMarkUsed) onMarkUsed(benefit);
  };

  return (
    <div className={`card border ${config.border} hover:shadow-md transition-all duration-200`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-snug">{benefit.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {benefit.category}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className={`badge ${config.badgeBg}`}>{benefit.discount}</div>
            {onFavoriteToggle && (
              <button
                onClick={handleFavorite}
                className={`p-1 rounded-lg transition-colors ${isFavorited ? 'text-amber-500 hover:text-amber-600' : 'text-gray-300 hover:text-amber-400'}`}
                title={isFavorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <Star className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Provider info */}
        {benefit.provider && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-md flex items-center justify-center overflow-hidden">
              {benefit.provider.logoUrl ? (
                <img
                  src={benefit.provider.logoUrl}
                  alt={benefit.provider.name}
                  className="w-4 h-4 object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              <span className="text-indigo-700 font-bold text-xs" style={{ display: benefit.provider.logoUrl ? 'none' : 'flex' }}>
                {benefit.provider.name.charAt(0)}
              </span>
            </div>
            <span className="text-xs text-gray-600 font-medium">{benefit.provider.name}</span>
            {benefit.provider.category && (
              <span className="text-xs text-gray-400">· {benefit.provider.category.name}</span>
            )}
          </div>
        )}

        {/* Context chips */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {benefit.merchant && (
            <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full">
              <Store className="w-3 h-3" />
              {benefit.merchant}
            </span>
          )}
          {benefit.minPurchase && (
            <span className="inline-flex items-center gap-1 text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full">
              <ShoppingCart className="w-3 h-3" />
              Mín. ${benefit.minPurchase.toLocaleString('es-CL')}
            </span>
          )}
          {benefit.location && (
            <span className="inline-flex items-center gap-1 text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full">
              <MapPin className="w-3 h-3" />
              {benefit.location}
            </span>
          )}
          {benefit.validDays && benefit.validDays.length > 0 && benefit.validDays.length < 7 && (
            <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
              <Calendar className="w-3 h-3" />
              {benefit.validDays.map((d) => DAY_NAMES[d]).join(', ')}
            </span>
          )}
          {benefit.maxDiscount && (
            <span className="inline-flex items-center gap-1 text-xs bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-full">
              Máx. ${benefit.maxDiscount.toLocaleString('es-CL')}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{benefit.description}</p>

        {/* Expandable details */}
        {(benefit.terms || benefit.validUntil) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            {expanded ? (
              <><ChevronUp className="w-3.5 h-3.5" />Ver menos</>
            ) : (
              <><ChevronDown className="w-3.5 h-3.5" />Ver detalles</>
            )}
          </button>
        )}

        {expanded && (
          <div className="mt-2 space-y-2 pt-2 border-t border-gray-100">
            {benefit.terms && (
              <div className="flex gap-2">
                <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-500">{benefit.terms}</p>
              </div>
            )}
            {benefit.validUntil && (
              <div className="flex gap-2 items-center">
                <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <p className="text-xs text-gray-500">
                  Válido hasta: {new Date(benefit.validUntil).toLocaleDateString('es-CL')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* "Ya lo usé" button */}
        {onMarkUsed && (
          <button
            onClick={handleMarkUsed}
            className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-200 hover:border-indigo-600 rounded-lg py-1.5 transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Ya lo usé
          </button>
        )}
      </div>
    </div>
  );
}
