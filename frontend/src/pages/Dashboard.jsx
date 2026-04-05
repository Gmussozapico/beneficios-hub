import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../context/AuthContext';
import BenefitCard from '../components/BenefitCard';
import { LayoutGrid, Star, Compass, ArrowRight, Sparkles, TrendingUp, Tag } from 'lucide-react';

const CATEGORY_EMOJI = {
  'Gastronomía': '☕',
  'Entretenimiento': '🎬',
  'Viajes': '✈️',
  'Compras': '🛍️',
  'Salud': '💊',
  'Streaming': '🎵',
  'Deporte': '🏋️',
  'Tecnología': '💻',
  'Combustible': '⛽',
  'Moda': '👗',
  'Seguros': '🛡️',
  'Telefonía': '📱',
  'Conectividad': '🌐',
};

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalBenefits: 0, totalProviders: 0, categoriesCount: 0 });
  const [recentBenefits, setRecentBenefits] = useState([]);
  const [userProviders, setUserProviders] = useState([]);
  const [todayBenefits, setTodayBenefits] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      const todayDay = new Date().getDay();
      const [statsRes, benefitsRes, providersRes, todayBenefitsRes] = await Promise.all([
        api.get('/api/user/stats'),
        api.get('/api/user/benefits'),
        api.get('/api/user/providers'),
        api.get(`/api/user/benefits?dayOfWeek=${todayDay}`),
      ]);
      setStats(statsRes.data);
      setRecentBenefits(benefitsRes.data.slice(0, 6));
      setUserProviders(providersRes.data);

      // Pick up to 4 from different categories
      const seenCategories = new Set();
      const recs = [];
      for (const b of todayBenefitsRes.data) {
        if (!seenCategories.has(b.category) && recs.length < 4) {
          seenCategories.add(b.category);
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

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const hasProviders = userProviders.length > 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <StatCard
          icon={Star}
          label="Beneficios disponibles"
          value={stats.totalBenefits}
          color="bg-gradient-to-br from-indigo-500 to-indigo-600"
        />
        <StatCard
          icon={LayoutGrid}
          label="Proveedores agregados"
          value={stats.totalProviders}
          color="bg-gradient-to-br from-violet-500 to-violet-600"
        />
        <StatCard
          icon={Tag}
          label="Categorías de beneficios"
          value={stats.categoriesCount}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
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
              <div key={benefit.id} className="card p-4 hover:shadow-md transition-all border-l-4 border-amber-400">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{CATEGORY_EMOJI[benefit.category] || '✨'}</span>
                  <span className="text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 px-2.5 py-1 rounded-full">
                    {benefit.discount}
                  </span>
                </div>
                <p className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">{benefit.title}</p>
                <p className="text-xs text-gray-400">{benefit.provider?.name}</p>
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
            <Link
              to="/mis-beneficios"
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentBenefits.length === 0 ? (
            <div className="card p-8 text-center text-gray-500">
              <p>Aún no hay beneficios. Agrega más proveedores.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentBenefits.map((benefit) => (
                <BenefitCard key={benefit.id} benefit={benefit} />
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
            <Link
              to="/explorar"
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              Gestionar
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex flex-wrap gap-3">
            {userProviders.map((provider) => (
              <div
                key={provider.id}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-lg flex items-center justify-center">
                  <span className="text-indigo-700 font-bold text-xs">
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
    </div>
  );
}
