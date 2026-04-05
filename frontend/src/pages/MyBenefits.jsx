import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import BenefitCard from '../components/BenefitCard';
import { Search, Filter, Compass, X, Star } from 'lucide-react';

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

  const loadBenefits = useCallback(async () => {
    try {
      const [benefitsRes, providersRes] = await Promise.all([
        api.get('/api/user/benefits'),
        api.get('/api/user/providers'),
      ]);
      setBenefits(benefitsRes.data);
      setFiltered(benefitsRes.data);
      setHasProviders(providersRes.data.length > 0);

      // Extract unique categories
      const cats = [...new Set(benefitsRes.data.map((b) => b.category))].sort();
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBenefits();
  }, [loadBenefits]);

  // Filter locally
  useEffect(() => {
    let result = benefits;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.provider?.name.toLowerCase().includes(q)
      );
    }

    if (selectedType) {
      result = result.filter((b) => b.type === selectedType);
    }

    if (selectedCategory) {
      result = result.filter((b) => b.category === selectedCategory);
    }

    if (selectedDay >= 0) {
      result = result.filter(b => b.validDays.length === 0 || b.validDays.includes(selectedDay));
    }

    setFiltered(result);
  }, [search, selectedType, selectedCategory, selectedDay, benefits]);

  const clearFilters = () => {
    setSearch('');
    setSelectedType('');
    setSelectedCategory('');
    setSelectedDay(-1);
  };

  const hasFilters = search || selectedType || selectedCategory || selectedDay >= 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
        <div className="flex gap-3 mb-6">
          <div className="h-10 bg-gray-200 rounded-lg flex-1 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded-lg w-40 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded-lg w-40 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse h-44" />
          ))}
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Beneficios</h1>
          <p className="text-sm text-gray-500">
            {benefits.length} beneficio{benefits.length !== 1 ? 's' : ''} disponibles
          </p>
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

      {/* Has providers */}
      {hasProviders && (
        <>
          {/* Day of week tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-5">
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

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar beneficios..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input sm:w-44"
            >
              {BENEFIT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input sm:w-44"
            >
              <option value="">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Active filters */}
          {hasFilters && (
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
              <button
                onClick={clearFilters}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Limpiar filtros
              </button>
            </div>
          )}

          {/* Benefits grid */}
          {filtered.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-900 font-semibold mb-1">Sin resultados</p>
              <p className="text-gray-500 text-sm">
                No se encontraron beneficios con los filtros actuales.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((benefit) => (
                <BenefitCard key={benefit.id} benefit={benefit} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
