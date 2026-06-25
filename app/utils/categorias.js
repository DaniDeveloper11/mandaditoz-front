import { Utensils, Plus, Sun, Car, Wrench, Briefcase, PawPrint } from '@lucide/vue'

export const CATEGORIA_CONFIG = {
  'comida': {
    icon: Utensils,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-700',
    badgeStyle: 'bg-blue-100 text-blue-700',
    accentColor: 'bg-amber-400',
  },
  'salud': {
    icon: Plus,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    badgeStyle: 'bg-emerald-100 text-emerald-700',
    accentColor: 'bg-emerald-500',
  },
  'turismo': {
    icon: Sun,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    badgeStyle: 'bg-amber-100 text-amber-700',
    accentColor: 'bg-blue-400',
  },
  'transporte': {
    icon: Car,
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-500',
    badgeStyle: 'bg-slate-100 text-slate-700',
    accentColor: 'bg-slate-400',
  },
  'comercio': {
    icon: Briefcase,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    badgeStyle: 'bg-indigo-100 text-indigo-700',
    accentColor: 'bg-indigo-400',
  },
  'ferreteria': {
    icon: Wrench,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    badgeStyle: 'bg-rose-100 text-rose-700',
    accentColor: 'bg-rose-400',
  },
  'mascotas': {
    icon: PawPrint,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    badgeStyle: 'bg-purple-100 text-purple-700',
    accentColor: 'bg-purple-400',
  },
}

const FALLBACK_CONFIG = {
  icon: Briefcase,
  iconBg: 'bg-gray-50',
  iconColor: 'text-gray-500',
  badgeStyle: 'bg-gray-100 text-gray-700',
  accentColor: 'bg-gray-400',
}

export function getCategoriaConfig(slug) {
  return CATEGORIA_CONFIG[slug] ?? FALLBACK_CONFIG
}
