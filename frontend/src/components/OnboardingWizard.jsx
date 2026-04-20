import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { Sparkles, ChevronRight, Check, X, Plus, Star } from 'lucide-react';

const CATEGORY_ICONS = { 'Banco': '🏦', 'Telefonía': '📱', 'Retail': '🛍️', 'Seguros': '🛡️', 'Entretenimiento': '🎬' };

export default function OnboardingWizard({ userName, onComplete }) {
  const [step, setStep] = useState(1); // 1=welcome, 2=select, 3=done
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState('');

  // Load providers on step 2
  useEffect(() => {
    if (step === 2) {
      setLoadingProviders(true);
      Promise.all([
        api.get('/api/providers'),
        api.get('/api/providers/categories'),
      ]).then(([providersRes, catsRes]) => {
        setProviders(providersRes.data);
        setCategories(catsRes.data);
        if (catsRes.data.length > 0) setActiveCategory(catsRes.data[0].id);
      }).catch(console.error)
        .finally(() => setLoadingProviders(false));
    }
  }, [step]);

  const toggleProvider = (id) => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleSaveProviders = async () => {
    if (selectedIds.size === 0) { setStep(3); return; }
    setSaving(true);
    try {
      await Promise.all(
        [...selectedIds].map((providerId) =>
          api.post('/api/user/providers', { providerId }).catch(() => {})
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
      setStep(3);
    }
  };

  const filteredProviders = activeCategory
    ? providers.filter((p) => p.categoryId === activeCategory)
    : providers;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-1 bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="flex flex-col items-center text-center p-8 flex-1">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Bienvenido{userName ? `, ${userName.split(' ')[0]}` : ''}! 🎉
            </h1>
            <p className="text-gray-500 max-w-md mb-2">
              Perksly centraliza todos los descuentos y beneficios de tus tarjetas y compañías en un solo lugar.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6 w-full">
              {[
                { icon: '🏦', title: 'Agrega tus tarjetas', desc: 'Bancos, telefonía y retail' },
                { icon: '🔍', title: 'Descubre beneficios', desc: 'Más de 200 descuentos reales' },
                { icon: '✅', title: 'Registra tus usos', desc: 'Lleva el control de tu ahorro' },
              ].map((f) => (
                <div key={f.title} className="bg-indigo-50 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="btn-primary px-8 py-3 text-base">
              Comenzar
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 2: Select providers */}
        {step === 2 && (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="p-6 pb-3 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Selecciona tus proveedores</h2>
              <p className="text-sm text-gray-500 mt-1">
                Elige los bancos, compañías y tarjetas que tienes para ver sus beneficios.
              </p>
              {/* Category tabs */}
              <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      activeCategory === cat.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>{CATEGORY_ICONS[cat.name] || '📦'}</span>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Providers grid */}
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              {loadingProviders ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredProviders.map((provider) => {
                    const selected = selectedIds.has(provider.id);
                    return (
                      <button
                        key={provider.id}
                        onClick={() => toggleProvider(provider.id)}
                        className={`relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                          selected
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 bg-white hover:border-indigo-300'
                        }`}
                      >
                        <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                          {provider.logoUrl ? (
                            <img src={provider.logoUrl} alt={provider.name} className="w-7 h-7 object-contain"
                              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }} />
                          ) : null}
                          <span className="text-indigo-700 font-bold text-sm" style={{ display: provider.logoUrl ? 'none' : 'flex' }}>
                            {provider.name.charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{provider.name}</p>
                          <p className="text-xs text-gray-400">{provider._count?.benefits ?? 0} beneficios</p>
                        </div>
                        {selected && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 flex items-center justify-between bg-white">
              <p className="text-sm text-gray-500">
                {selectedIds.size > 0 ? (
                  <span className="font-medium text-indigo-600">{selectedIds.size} seleccionado{selectedIds.size !== 1 ? 's' : ''}</span>
                ) : 'Selecciona al menos uno'}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setStep(3)} className="btn-ghost text-sm">
                  Saltar por ahora
                </button>
                <button
                  onClick={handleSaveProviders}
                  disabled={saving}
                  className="btn-primary text-sm"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Continuar <ChevronRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 3 && (
          <div className="flex flex-col items-center text-center p-8 flex-1">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-200">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Todo listo! 🚀</h2>
            <p className="text-gray-500 max-w-sm mb-6">
              {selectedIds.size > 0
                ? `Agregaste ${selectedIds.size} proveedor${selectedIds.size !== 1 ? 'es' : ''}. Ya puedes ver todos tus beneficios.`
                : 'Puedes agregar proveedores en cualquier momento desde "Explorar".'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={onComplete} className="btn-primary px-8 py-3 text-base">
                <Sparkles className="w-5 h-5" />
                Ver mis beneficios
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
