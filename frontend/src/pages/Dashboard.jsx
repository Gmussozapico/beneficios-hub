import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../context/AuthContext';
import BenefitCard from '../components/BenefitCard';
import UsageModal from '../components/UsageModal';
import OnboardingWizard from '../components/OnboardingWizard';
import { LayoutGrid, Star, Compass, ArrowRight, Sparkles, TrendingUp, Tag, PiggyBank, CheckCircle2 } from 'lucide-react';

const CATEGORY_EMOJI = {
  'Café':         '☕',
  'Restaurante':  '🍽️',
  'Cine':         '🎬',
  'Eventos':      '🎭',
  'Moda':         '👗',
  'Deporte':      '🏋️',
  'Viajes':       '✈️',
  'Salud':        '💊',
  'Tecnología':   '💻',
  'Streaming':    '🎵',
  'Supermercado': '🛒',
  'Combustible':  '⛽',
  'Seguros':      '🛡️',
};

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalBenefits: 0, totalProviders: 0, categoriesCount: 0, totalSaved: 0, totalUsages: 0 });
  const [recentBenefits, setRecentBenefits] = useState([]);
  const [userProviders, setUserProviders] = useState([]);
  const [todayBenefits, setTodayBenefits] = useState([]);
  const [usageModal, setUsageModal] = useState(null); // benefit to record usage
  const [favIds, setFavIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem('perksly_show_onboarding') === 'true';
  });

  const loadDashboardData = useCallback(async () => {
    try {
      const todayDay = new Date().getDay();
      const [statsRes, benefitsRes, providersRes, todayRes, favsRes] = await Promise.all([
        api.get('/api/user/stats'),
        api.get('/api/user/benefits'),
        api.get('/api/user/providers'),
        api.get(`/api/user/benefits?dayOfWeek=${todayDay}`),
        api.get('/api/user/favorites'),
      ]);
      setStats(statsRes.data);
      setRecentBenefits(benefitsRes.data.slice(0, 6));
      setUserProviders(providersRes.data);
      setFavIds(new Set(favsRes.data.map((f) => f.benefitId)));

      // Pick up to 4 from different categories
      const seen = new Set();
      const recs = [];
      for (const b of todayRes.data) {
        if (!seen.has(b.category) && recs.length < 4) {
          seen.add(b.category);
          recs.push(b);
        }
      }
      setTodayBenefits(recs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboardData(); }, [loadDashboardData]);

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

  const handleUsageSuccess = (savedAmount) => {
    setStats((prev) => ({
      ...prev,
      totalSaved: (prev.totalSaved || 0) + (savedAmount || 0),
      totalUsages: (prev.totalUsages || 0) + 1,
    }));
  };

  const hasProviders = userProviders.length > 0;

  const formatCLP = (n) => n ? `$${n.toLocaleString('es-CL')}` : '$0';

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-xl mb-3" />
              <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-28" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Hola, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {hasProviders
            ? `Tienes acceso a ${stats.totalBenefits} beneficios de ${stats.totalProviders} proveedor${stats.totalProviders !== 1 ? 'es' : ''}.`
            : 'Agrega tus primeros proveedores para ver tus beneficios.'}
        </p>
      </div>

      {/* Stats — 4 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatCard icon={Star} label="Beneficios disponibles" value={stats.totalBenefits} color="bg-gradient-to-br from-indigo-500 to-indigo-600" />
        <StatCard icon={LayoutGrid} label="Proveedores" value={stats.totalProviders} color="bg-gradient-to-br from-violet-500 to-violet-600" />
        <StatCard icon={Tag} label="Categorías" value={stats.categoriesCount} color="bg-gradient-to-br from-purple-500 to-purple-600" />
        <StatCard
          icon={PiggyBank}
          label="Ahorro registrado"
          value={formatCLP(stats.totalSaved)}
          color="bg-gradient-to-br from-emerald-500 to-teal-600"
          sub={stats.totalUsages ? `${stats.totalUsages} uso${stats.totalUsages !== 1 ? 's' : ''} registrado${stats.totalUsages !== 1 ? 's' : ''}` : 'Registra tus usos'}
        />
      </div>

      {/* Today's recommendations */}
      {hasProviders && todayBenefits.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Beneficios para hoy</h2>
              <p className="text-xs text-gray-400">{['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][new Date().getDay()]}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {todayBenefits.map((benefit) => (
              <div key={benefit.id} className="card p-4 hover:shadow-md transition-all border-l-4 border-amber-400 group">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{CATEGORY_EMOJI[benefit.category] || '✨'}</span>
                  <span className="text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 px-2.5 py-1 rounded-full">
                    {benefit.discount}
                  </span>
                </div>
                <p className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">{benefit.title}</p>
                {benefit.merchant && (
                  <p className="text-xs text-indigo-600 mb-1">📍 {benefit.merchant}</p>
                )}
                <p className="text-xs text-gray-400">{benefit.provider?.name}</p>
                <button
                  onClick={() => setUsageModal(benefit)}
                  className="mt-2 w-full text-xs text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-200 hover:border-indigo-600 rounded-lg py-1 transition-all font-medium flex items-center justify-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Ya lo usé
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No providers CTA */}
      {!hasProviders && (
        <div className="card p-10 text-center mb-10 border-2 border-dashed border-indigo-200 bg-indigo-50/50">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Agrega tus primeros proveedores</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Selecciona tus bancos, compañías de telefonía y tarjetas de retail para ver todos sus beneficios en un solo lugar.
          </p>
          <Link to="/explorar" className="btn-primary inline-flex">
            <Compass className="w-4 h-4" />
            Explorar proveedores
          </Link>
        </div>
      )}

      {/* Recent Benefits */}
      {hasProviders && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-900">Tus beneficios recientes</h2>
            </div>
            <Link to="/mis-beneficios" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentBenefits.length === 0 ? (
            <div className="card p-8 text-center text-gray-500">
              <p>Aún no hay beneficios. Agrega más proveedores.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentBenefits.map((benefit) => (
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

      {/* My Providers summary */}
      {hasProviders && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-900">Mis proveedores</h2>
            </div>
            <Link to="/explorar" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
              Gestionar <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {userProviders.map((provider) => (
              <div key={provider.id} className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
                <div className="w-7 h-7 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {provider.logoUrl ? (
                    <img src={provider.logoUrl} alt={provider.name} className="w-5 h-5 object-contain"
                      onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextSibling.style.display='flex'; }} />
                  ) : null}
                  <span className="text-indigo-700 font-bold text-xs" style={{ display: provider.logoUrl ? 'none' : 'flex' }}>
                    {provider.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{provider.name}</p>
                  <p className="text-xs text-gray-400">{provider._count?.benefits ?? 0} beneficios</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Modal */}
      {usageModal && (
        <UsageModal
          benefit={usageModal}
          onClose={() => setUsageModal(null)}
          onSuccess={handleUsageSuccess}
        />
      )}

      {/* Onboarding Wizard — first login after registration */}
      {showOnboarding && (
        <OnboardingWizard
          userName={user?.name}
          onComplete={() => {
            localStorage.removeItem('perksly_show_onboarding');
            setShowOnboarding(false);
            loadDashboardData();
          }}
        />
      )}
    </div>
  );
}
