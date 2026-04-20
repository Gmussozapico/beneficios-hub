import React, { useState } from 'react';
import { X, CheckCircle2, DollarSign, Sparkles } from 'lucide-react';
import { api } from '../context/AuthContext';

export default function UsageModal({ benefit, onClose, onSuccess }) {
  const [savedAmount, setSavedAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!benefit) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post(`/api/user/benefits/${benefit.id}/use`, {
        savedAmount: savedAmount ? parseInt(savedAmount.replace(/\./g, ''), 10) : null,
      });
      onSuccess && onSuccess(savedAmount ? parseInt(savedAmount.replace(/\./g, ''), 10) : null);
      onClose();
    } catch (err) {
      setError('Error al registrar el uso. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Format input as CLP with dots
  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw === '') { setSavedAmount(''); return; }
    const num = parseInt(raw, 10);
    setSavedAmount(num.toLocaleString('es-CL'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">¡Usaste este beneficio!</h2>
              <p className="text-xs text-gray-500">Registra cuánto ahorraste</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Benefit preview */}
        <div className="px-5 py-4 bg-indigo-50/50 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900 line-clamp-1">{benefit.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{benefit.provider?.name} · {benefit.category}</p>
          <div className="mt-2 inline-block bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {benefit.discount}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              ¿Cuánto ahorraste? <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={savedAmount}
                onChange={handleAmountChange}
                className="input pl-7 text-right font-mono"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Tu ahorro se sumará al total en tu dashboard
            </p>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-ghost text-sm"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary text-sm"
              disabled={loading}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Registrar uso
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
