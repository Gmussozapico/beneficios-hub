import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import BenefitCard from '../components/BenefitCard';
import UsageModal from '../components/UsageModal';
import { Search, Filter, Compass, X, Star, List, LayoutGrid, Calendar, Sunset, BookmarkCheck } from 'lucide-react';

const BENEFIT_TYPES = [
  { value: '', label: 'Todos los tipos' },
  { value: 'PERCENTAGE', label: 'Descuento %' },
  { value: 'AMOUNT', label: 'Monto fijo' },
  { value: 'FREEBIE', label: 'Regalo / Gratis' },
  { value: 'SPECIAL', label: 'Especial' },
];

const DAYS = [
  { value: -1, label: 'Todos' },
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
];
const TODAY = new Date().getDay();

const CATEGORY_CONFIG = {
  'Café':         { emoji: '☕', color: 'from-amber-400 to-orange-400' },
  'Restaurante':  { emoji: '🍽️', color: 'from-red-400 to-rose-500' },
  'Cine':         { emoji: '🎬', color: 'from-violet-500 to-purple-600' },
  'Eventos':      { emoji: '🎭', color: 'from-pink-400 to-rose-500' },
  'Moda':         { emoji: '👗', color: 'from-fuchsia-400 to-pink-500' },
  'Deporte':      { emoji: '🏋️', color: 'from-green-400 to-emerald-500' },
  'Viajes':       { emoji: '✈️', color: 'from-sky-400 to-blue-500' },
  'Salud':        { emoji: '💊', color: 'from-teal-400 to-cyan-500' },
  'Tecnología':   { emoji: '💻', color: 'from-slate-500 to-gray-600' },
  'Streaming':    { emoji: '🎵', color: 'from-indigo-400 to-violet-500' },
  'Supermercado': { emoji: '🛒', color: 'from-lime-400 to-green-500' },
  'Combustible':  { emoji: '⛽', color: 'from-orange-400 to-amber-500' },
  'Seguros':      { emoji: '🛡️', color: 'from-blue-400 to-indigo-500' },
};

export default function MyBenefits() {
  const [benefits, setBenefits] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDay, setSelectedDay] = useState(-1);
  const [categories, setCategories] = useState([]);
  const [hasProviders, setHasProviders] = useState(true);
  const [viewMode, setViewMode] = useState('sections'); // 'sections' | 'list' | 'favorites'
  const [favIds, setFavIds] = useState(new Set());
  const [usageModal, setUsageModal] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [benefitsRes, providersRes, favsRes] = await Promise.all([
        api.get('/api/user/benefits'),
        api.get('/api/user/providers'),
        api.get('/api/user/favorites'),
      ]);
      setBenefits(benefitsRes.data);
      setFiltered(benefitsRes.data);
      setHasProviders(providersRes.data.length > 0);
      setFavIds(new Set(favsRes.data.map((f) => f.benefitId)));
      const cats = [...new Set(benefitsRes.data.map((b) => b.category))].sort();
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Filter locally
  useEffect(() => {
    let result = benefits;

    if (viewMode === 'favorites') {
      result = result.filter((b) => favIds.has(b.id));
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.provider?.name.toLowerCase().includes(q) ||
          (b.merchant && b.merchant.toLowerCase().includes(q))
      );
    }
    if (selectedType) result = result.filter((b) => b.type === selectedType);
    if (selectedCategory) result = result.filter((b) => b.category === selectedCategory);
    if (selectedDay >= 0) {
      result = result.filter((b) => b.validDays.length === 0 || b.validDays.includes(selectedDay));
    }

    setFiltered(result);
  }, [search, selectedType, selectedCategory, selectedDay, benefits, viewMode, favIds]);

  const clearFilters = () => {
    setSearch('');
    setSelectedType('');
    setSelectedCategory('');
    setSelectedDay(-1);
  };

  const handleFavoriteToggle = async (benefitId, isFav) => {
    try {
      if (isFav) {
        await api.delete(`/api/user/favorites/${benefitId}`);
        setFavIds((prev) => { const n = new Set(prev); n.delete(benefitId); return n; });
      } else {
        await api.post(`/api/user/favorites/${benefitId}`);
        setFavIds((prev) => new Set([...prev, benefitId]));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const setTodayFilter = () => setSelectedDay(TODAY);
  const setWeekendFilter = () => {
    // We'll use a special day value — handled below
    setSelectedDay(TODAY === 0 || TODAY === 6 ? TODAY : 'weekend');
  };

  // Context chip: "Este fin de semana"
  const isWeekend = selectedDay === 'weekend';
  const weekendFiltered = isWeekend
    ? benefits.filter((b) => b.validDays.length === 0 || b.validDays.some((d) => [0, 6].includes(d)))
    : null;

  // Merge weekend filter
  const displayFiltered = isWeekend ? weekendFiltered.filter((b) => {
    if (viewMode === 'favorites' && !favIds.has(b.id)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!b.title.toLowerCase().includes(q) && !b.description.toLowerCase().includes(q) &&
        !b.provider?.name.toLowerCase().includes(q) && !(b.merchant && b.merchant.toLowerCase().includes(q))) return false;
    }
    if (selectedType && b.type !== selectedType) return false;
    if (selectedCategory && b.category !== selectedCategory) return false;
    return true;
  }) : filtered;

  const hasFilters = search || selectedType || selectedCategory || selectedDay >= 0 || isWeekend;
  const favCount = benefits.filter((b) => favIds.has(b.id)).length;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
        <div className="flex gap-3 mb-6">
          <div className="h-10 bg-gray-200 rounded-lg flex-1 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded-lg w-40 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => <div key={i} className="card p-4 animate-pulse h-44" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center">
          <Star className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Mis Beneficios</h1>
          <p className="text-sm text-gray-500">
            {benefits.length} beneficio{benefits.length !== 1 ? 's' : ''} disponibles
          </p>
        </div>
        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('sections')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'sections' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            title="Vista por secciones"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            title="Vista en lista"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('favorites')}
            className={`p-1.5 rounded-md transition-colors relative ${viewMode === 'favorites' ? 'bg-white shadow-sm text-amber-500' : 'text-gray-400 hover:text-amber-400'}`}
            title="Favoritos"
          >
            <Star className={`w-4 h-4 ${viewMode === 'favorites' ? 'fill-current' : ''}`} />
            {favCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {favCount > 9 ? '9+' : favCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* No providers */}
      {!hasProviders && (
        <div className="card p-10 text-center border-2 border-dashed border-indigo-200 bg-indigo-50/50">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Compass className="w-7 h-7 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No hay proveedores agregados</h2>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Agrega tus bancos, telefonías y tarjetas para ver sus beneficios aquí.
          </p>
          <Link to="/explorar" className="btn-primary inline-flex">
            <Compass className="w-4 h-4" />
            Explorar proveedores
          </Link>
        </div>
      )}

      {hasProviders && (
        <>
          {/* Day of week tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-4">
            {DAYS.map((d) => (
              <button
                key={d.value}
                onClick={() => setSelectedDay(d.value)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedDay === d.value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : d.value === TODAY
                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {d.value === TODAY && d.value >= 0 ? `${d.label} ✦` : d.label}
              </button>
            ))}
          </div>

          {/* Context chips */}
          <div className="flex flex-wrap gap-2 mb-5">
            <button
              onClick={setTodayFilter}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedDay === TODAY
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              <Calendar className="w-3 h-3" />
              Hoy
            </button>
            <button
              onClick={() => setSelectedDay(isWeekend ? -1 : 'weekend')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                isWeekend
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300 hover:text-violet-600'
              }`}
            >
              <Sunset className="w-3 h-3" />
              Este fin de semana
            </button>
            {favCount > 0 && (
              <button
                onClick={() => setViewMode(viewMode === 'favorites' ? 'sections' : 'favorites')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  viewMode === 'favorites'
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300 hover:text-amber-600'
                }`}
              >
                <BookmarkCheck className="w-3 h-3" />
                Favoritos ({favCount})
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, local o proveedor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="input sm:w-44">
              {BENEFIT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="input sm:w-44">
              <option value="">Todas las categorías</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Active filters */}
          {hasFilters && (
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">{displayFiltered.length} resultado{displayFiltered.length !== 1 ? 's' : ''}</span>
              <button onClick={clearFilters} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
                <X className="w-3.5 h-3.5" />
                Limpiar filtros
              </button>
            </div>
          )}

          {/* Favorites empty state */}
          {viewMode === 'favorites' && favCount === 0 && (
            <div className="card p-10 text-center">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-amber-400" />
              </div>
              <p className="text-gray-900 font-semibold mb-1">Sin favoritos aún</p>
              <p className="text-gray-500 text-sm">
                Presiona la ⭐ en cualquier beneficio para guardarlo aquí.
              </p>
              <button onClick={() => setViewMode('sections')} className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                Ver todos los beneficios
              </button>
            </div>
          )}

          {/* Benefits content */}
          {displayFiltered.length === 0 && !(viewMode === 'favorites' && favCount === 0) ? (
            <div className="card p-10 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-900 font-semibold mb-1">Sin resultados</p>
              <p className="text-gray-500 text-sm">No se encontraron beneficios con los filtros actuales.</p>
              <button onClick={clearFilters} className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                Limpiar filtros
              </button>
            </div>
          ) : viewMode === 'sections' || viewMode === 'favorites' ? (
            /* ── Sections / Favorites view ── */
            <div className="space-y-8">
              {Object.entries(
                displayFiltered.reduce((acc, b) => {
                  if (!acc[b.category]) acc[b.category] = [];
                  acc[b.category].push(b);
                  return acc;
                }, {})
              )
                .sort(([, a], [, b]) => b.length - a.length)
                .map(([category, catBenefits]) => {
                  const config = CATEGORY_CONFIG[category] || { emoji: '🎁', color: 'from-gray-400 to-gray-500' };
                  return (
                    <div key={category}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-xl`}>
                          {config.emoji}
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">{category}</h2>
                        <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-1 rounded-full">
                          {catBenefits.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {catBenefits.map((benefit) => (
                          <BenefitCard
                            key={benefit.id}
                            benefit={benefit}
                            isFavorited={favIds.has(benefit.id)}
                            onFavoriteToggle={handleFavoriteToggle}
                            onMarkUsed={(b) => setUsageModal(b)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            /* ── List view ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayFiltered.map((benefit) => (
                <BenefitCard
                  key={benefit.id}
                  benefit={benefit}
                  isFavorited={favIds.has(benefit.id)}
                  onFavoriteToggle={handleFavoriteToggle}
                  onMarkUsed={(b) => setUsageModal(b)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Usage Modal */}
      {usageModal && (
        <UsageModal
          benefit={usageModal}
          onClose={() => setUsageModal(null)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}
