'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import confetti from 'canvas-confetti'
import { urlFor } from '@/lib/sanity'

interface EventData {
  _id: string
  title: string
  description?: string
  eventDate: string
  template?: string
  eventType?: string
  customIcon?: any
  heroImage?: any
  gallery?: Array<{ asset: any; caption?: string }>
  backgroundMusic?: { asset?: { url?: string } }
  showCountdown?: boolean
  theme?: {
    colorScheme?: string
    fontFamily?: string
  }
  itinerary?: Array<{ time?: string; activity?: string; description?: string; icon?: string }>
  parents?: { father?: string; mother?: string }
  godparents?: Array<{ type?: string; name?: string }>
  location?: {
    venueName?: string
    address?: string
    city?: string
    state?: string
    time?: string
    coordinates?: { lat: number; lng: number }
  }
  ceremonyLocation?: {
    venueName?: string
    address?: string
    time?: string
  }
  receptionLocation?: {
    venueName?: string
    address?: string
    time?: string
  }
  giftRegistry?: {
    enabled?: boolean
    message?: string
    stores?: Array<{ name?: string; code?: string; url?: string }>
    cashGift?: {
      enabled?: boolean
      bankName?: string
      accountNumber?: string
      clabe?: string
      accountHolder?: string
    }
  }
  rsvpEnabled?: boolean
}

/** Acentos por `theme.colorScheme` de Sanity (Tailwind completo para JIT). */
interface ThemeTone {
  pageBg: string
  heading: string
  subheading: string
  borderHero: string
  sectionBorder: string
  sectionTitle: string
  iconWrap: string
  link: string
  btnPrimary: string
  btnPrimaryHover: string
  focusRing: string
  focusBorder: string
  badgePill: string
  countdownCell: string
  countdownNumber: string
  itineraryRow: string
  itineraryDot: string
  giftBorder: string
  giftBg: string
  giftLink: string
  footerTitle: string
  musicBtn: string
  sparkleBtn: string
  subtitleAccent: string
  loadingBorder: string
  doveIcon: string
}

const TONES: Record<string, ThemeTone> = {
  ocean: {
    pageBg: 'from-cyan-50 via-sky-50 to-indigo-50',
    heading: 'text-sky-950',
    subheading: 'text-sky-900/70',
    borderHero: 'border-sky-100',
    sectionBorder: 'border-sky-100',
    sectionTitle: 'text-sky-900',
    iconWrap: 'bg-sky-50 border-sky-100 text-sky-700',
    link: 'text-sky-700 font-semibold hover:underline',
    btnPrimary: 'bg-sky-800',
    btnPrimaryHover: 'hover:bg-sky-900',
    focusRing: 'focus:ring-sky-200',
    focusBorder: 'focus:border-sky-500',
    badgePill: 'bg-sky-700 text-white',
    countdownCell: 'from-sky-100 to-white border-sky-100',
    countdownNumber: 'text-sky-900',
    itineraryRow: 'border-sky-100 from-white to-sky-50',
    itineraryDot: 'bg-sky-600',
    giftBorder: 'border-amber-100',
    giftBg: 'bg-amber-50/60',
    giftLink: 'text-sky-700',
    footerTitle: 'text-sky-950',
    musicBtn: 'border-sky-200 hover:bg-sky-50',
    sparkleBtn:
      'bg-gradient-to-r from-amber-200 to-sky-300 hover:from-amber-300 hover:to-sky-400 text-sky-900 border-amber-200/80',
    subtitleAccent: 'text-amber-700',
    loadingBorder: 'border-sky-700',
    doveIcon: 'text-sky-700',
  },
  rainbow: {
    pageBg: 'from-indigo-50 via-fuchsia-50 to-pink-50',
    heading: 'text-indigo-950',
    subheading: 'text-fuchsia-900/70',
    borderHero: 'border-fuchsia-100',
    sectionBorder: 'border-fuchsia-100',
    sectionTitle: 'text-indigo-900',
    iconWrap: 'bg-fuchsia-50 border-fuchsia-100 text-fuchsia-800',
    link: 'text-fuchsia-700 font-semibold hover:underline',
    btnPrimary: 'bg-indigo-800',
    btnPrimaryHover: 'hover:bg-indigo-900',
    focusRing: 'focus:ring-fuchsia-200',
    focusBorder: 'focus:border-fuchsia-500',
    badgePill: 'bg-indigo-700 text-white',
    countdownCell: 'from-fuchsia-100 to-white border-fuchsia-100',
    countdownNumber: 'text-indigo-900',
    itineraryRow: 'border-fuchsia-100 from-white to-fuchsia-50',
    itineraryDot: 'bg-fuchsia-600',
    giftBorder: 'border-pink-100',
    giftBg: 'bg-pink-50/70',
    giftLink: 'text-fuchsia-700',
    footerTitle: 'text-indigo-950',
    musicBtn: 'border-fuchsia-200 hover:bg-fuchsia-50',
    sparkleBtn:
      'bg-gradient-to-r from-pink-200 to-indigo-300 hover:from-pink-300 hover:to-indigo-400 text-indigo-900 border-pink-200/80',
    subtitleAccent: 'text-pink-700',
    loadingBorder: 'border-indigo-700',
    doveIcon: 'text-fuchsia-700',
  },
  purple: {
    pageBg: 'from-violet-50 via-purple-50 to-indigo-50',
    heading: 'text-violet-950',
    subheading: 'text-violet-900/70',
    borderHero: 'border-violet-100',
    sectionBorder: 'border-violet-100',
    sectionTitle: 'text-violet-900',
    iconWrap: 'bg-violet-50 border-violet-100 text-violet-800',
    link: 'text-violet-700 font-semibold hover:underline',
    btnPrimary: 'bg-violet-800',
    btnPrimaryHover: 'hover:bg-violet-900',
    focusRing: 'focus:ring-violet-200',
    focusBorder: 'focus:border-violet-500',
    badgePill: 'bg-violet-700 text-white',
    countdownCell: 'from-violet-100 to-white border-violet-100',
    countdownNumber: 'text-violet-900',
    itineraryRow: 'border-violet-100 from-white to-violet-50',
    itineraryDot: 'bg-violet-600',
    giftBorder: 'border-purple-100',
    giftBg: 'bg-purple-50/70',
    giftLink: 'text-violet-700',
    footerTitle: 'text-violet-950',
    musicBtn: 'border-violet-200 hover:bg-violet-50',
    sparkleBtn:
      'bg-gradient-to-r from-purple-200 to-violet-300 hover:from-purple-300 hover:to-violet-400 text-violet-900 border-purple-200/80',
    subtitleAccent: 'text-purple-700',
    loadingBorder: 'border-violet-700',
    doveIcon: 'text-violet-700',
  },
  pink: {
    pageBg: 'from-rose-50 via-pink-50 to-fuchsia-50',
    heading: 'text-rose-950',
    subheading: 'text-rose-900/70',
    borderHero: 'border-rose-100',
    sectionBorder: 'border-rose-100',
    sectionTitle: 'text-rose-900',
    iconWrap: 'bg-rose-50 border-rose-100 text-rose-700',
    link: 'text-rose-700 font-semibold hover:underline',
    btnPrimary: 'bg-rose-800',
    btnPrimaryHover: 'hover:bg-rose-900',
    focusRing: 'focus:ring-rose-200',
    focusBorder: 'focus:border-rose-500',
    badgePill: 'bg-rose-700 text-white',
    countdownCell: 'from-rose-100 to-white border-rose-100',
    countdownNumber: 'text-rose-900',
    itineraryRow: 'border-rose-100 from-white to-rose-50',
    itineraryDot: 'bg-rose-600',
    giftBorder: 'border-pink-100',
    giftBg: 'bg-pink-50/70',
    giftLink: 'text-rose-700',
    footerTitle: 'text-rose-950',
    musicBtn: 'border-rose-200 hover:bg-rose-50',
    sparkleBtn:
      'bg-gradient-to-r from-pink-200 to-rose-300 hover:from-pink-300 hover:to-rose-400 text-rose-900 border-pink-200/80',
    subtitleAccent: 'text-fuchsia-700',
    loadingBorder: 'border-rose-700',
    doveIcon: 'text-rose-700',
  },
  orange: {
    pageBg: 'from-amber-50 via-orange-50 to-yellow-50',
    heading: 'text-orange-950',
    subheading: 'text-orange-900/70',
    borderHero: 'border-orange-100',
    sectionBorder: 'border-orange-100',
    sectionTitle: 'text-orange-900',
    iconWrap: 'bg-orange-50 border-orange-100 text-orange-800',
    link: 'text-orange-700 font-semibold hover:underline',
    btnPrimary: 'bg-orange-800',
    btnPrimaryHover: 'hover:bg-orange-900',
    focusRing: 'focus:ring-orange-200',
    focusBorder: 'focus:border-orange-500',
    badgePill: 'bg-orange-700 text-white',
    countdownCell: 'from-orange-100 to-white border-orange-100',
    countdownNumber: 'text-orange-900',
    itineraryRow: 'border-orange-100 from-white to-orange-50',
    itineraryDot: 'bg-orange-600',
    giftBorder: 'border-amber-100',
    giftBg: 'bg-amber-50/80',
    giftLink: 'text-orange-700',
    footerTitle: 'text-orange-950',
    musicBtn: 'border-orange-200 hover:bg-orange-50',
    sparkleBtn:
      'bg-gradient-to-r from-yellow-200 to-orange-300 hover:from-yellow-300 hover:to-orange-400 text-orange-900 border-yellow-200/80',
    subtitleAccent: 'text-amber-800',
    loadingBorder: 'border-orange-700',
    doveIcon: 'text-orange-700',
  },
  green: {
    pageBg: 'from-emerald-50 via-teal-50 to-cyan-50',
    heading: 'text-emerald-950',
    subheading: 'text-emerald-900/70',
    borderHero: 'border-emerald-100',
    sectionBorder: 'border-emerald-100',
    sectionTitle: 'text-emerald-900',
    iconWrap: 'bg-emerald-50 border-emerald-100 text-emerald-800',
    link: 'text-emerald-700 font-semibold hover:underline',
    btnPrimary: 'bg-emerald-800',
    btnPrimaryHover: 'hover:bg-emerald-900',
    focusRing: 'focus:ring-emerald-200',
    focusBorder: 'focus:border-emerald-500',
    badgePill: 'bg-emerald-700 text-white',
    countdownCell: 'from-emerald-100 to-white border-emerald-100',
    countdownNumber: 'text-emerald-900',
    itineraryRow: 'border-emerald-100 from-white to-emerald-50',
    itineraryDot: 'bg-emerald-600',
    giftBorder: 'border-teal-100',
    giftBg: 'bg-teal-50/70',
    giftLink: 'text-emerald-700',
    footerTitle: 'text-emerald-950',
    musicBtn: 'border-emerald-200 hover:bg-emerald-50',
    sparkleBtn:
      'bg-gradient-to-r from-teal-200 to-emerald-300 hover:from-teal-300 hover:to-emerald-400 text-emerald-900 border-teal-200/80',
    subtitleAccent: 'text-teal-700',
    loadingBorder: 'border-emerald-700',
    doveIcon: 'text-emerald-700',
  },
  red: {
    pageBg: 'from-red-50 via-rose-50 to-orange-50',
    heading: 'text-red-950',
    subheading: 'text-red-900/70',
    borderHero: 'border-red-100',
    sectionBorder: 'border-red-100',
    sectionTitle: 'text-red-900',
    iconWrap: 'bg-red-50 border-red-100 text-red-800',
    link: 'text-red-700 font-semibold hover:underline',
    btnPrimary: 'bg-red-800',
    btnPrimaryHover: 'hover:bg-red-900',
    focusRing: 'focus:ring-red-200',
    focusBorder: 'focus:border-red-500',
    badgePill: 'bg-red-700 text-white',
    countdownCell: 'from-red-100 to-white border-red-100',
    countdownNumber: 'text-red-900',
    itineraryRow: 'border-red-100 from-white to-red-50',
    itineraryDot: 'bg-red-600',
    giftBorder: 'border-rose-100',
    giftBg: 'bg-rose-50/70',
    giftLink: 'text-red-700',
    footerTitle: 'text-red-950',
    musicBtn: 'border-red-200 hover:bg-red-50',
    sparkleBtn:
      'bg-gradient-to-r from-rose-200 to-red-300 hover:from-rose-300 hover:to-red-400 text-red-900 border-rose-200/80',
    subtitleAccent: 'text-orange-700',
    loadingBorder: 'border-red-700',
    doveIcon: 'text-red-700',
  },
  black: {
    pageBg: 'from-slate-200 via-zinc-100 to-slate-300',
    heading: 'text-slate-950',
    subheading: 'text-slate-800/80',
    borderHero: 'border-slate-200',
    sectionBorder: 'border-slate-200',
    sectionTitle: 'text-slate-900',
    iconWrap: 'bg-slate-100 border-slate-200 text-slate-800',
    link: 'text-slate-800 font-semibold hover:underline',
    btnPrimary: 'bg-slate-900',
    btnPrimaryHover: 'hover:bg-black',
    focusRing: 'focus:ring-slate-300',
    focusBorder: 'focus:border-slate-600',
    badgePill: 'bg-slate-800 text-white',
    countdownCell: 'from-slate-200 to-white border-slate-200',
    countdownNumber: 'text-slate-900',
    itineraryRow: 'border-slate-200 from-white to-slate-50',
    itineraryDot: 'bg-slate-700',
    giftBorder: 'border-zinc-200',
    giftBg: 'bg-zinc-50/80',
    giftLink: 'text-slate-800',
    footerTitle: 'text-slate-950',
    musicBtn: 'border-slate-300 hover:bg-slate-100',
    sparkleBtn:
      'bg-gradient-to-r from-slate-300 to-zinc-400 hover:from-slate-400 hover:to-zinc-500 text-slate-900 border-slate-300/80',
    subtitleAccent: 'text-amber-800',
    loadingBorder: 'border-slate-800',
    doveIcon: 'text-slate-700',
  },
  white: {
    pageBg: 'from-white via-slate-50 to-sky-50',
    heading: 'text-slate-900',
    subheading: 'text-slate-600',
    borderHero: 'border-slate-200',
    sectionBorder: 'border-slate-200',
    sectionTitle: 'text-slate-800',
    iconWrap: 'bg-slate-50 border-slate-200 text-slate-700',
    link: 'text-sky-700 font-semibold hover:underline',
    btnPrimary: 'bg-slate-800',
    btnPrimaryHover: 'hover:bg-slate-900',
    focusRing: 'focus:ring-sky-200',
    focusBorder: 'focus:border-sky-500',
    badgePill: 'bg-slate-700 text-white',
    countdownCell: 'from-slate-100 to-white border-slate-200',
    countdownNumber: 'text-slate-900',
    itineraryRow: 'border-slate-200 from-white to-slate-50',
    itineraryDot: 'bg-slate-600',
    giftBorder: 'border-slate-200',
    giftBg: 'bg-slate-50/90',
    giftLink: 'text-sky-700',
    footerTitle: 'text-slate-900',
    musicBtn: 'border-slate-200 hover:bg-slate-50',
    sparkleBtn:
      'bg-gradient-to-r from-sky-100 to-slate-200 hover:from-sky-200 hover:to-slate-300 text-slate-900 border-slate-200/80',
    subtitleAccent: 'text-sky-800',
    loadingBorder: 'border-slate-700',
    doveIcon: 'text-slate-600',
  },
  sunset: {
    pageBg: 'from-orange-50 via-rose-50 to-purple-50',
    heading: 'text-orange-950',
    subheading: 'text-orange-900/70',
    borderHero: 'border-orange-100',
    sectionBorder: 'border-orange-100',
    sectionTitle: 'text-rose-900',
    iconWrap: 'bg-orange-50 border-orange-100 text-orange-800',
    link: 'text-rose-700 font-semibold hover:underline',
    btnPrimary: 'bg-rose-800',
    btnPrimaryHover: 'hover:bg-rose-900',
    focusRing: 'focus:ring-rose-200',
    focusBorder: 'focus:border-rose-500',
    badgePill: 'bg-orange-700 text-white',
    countdownCell: 'from-orange-100 to-white border-orange-100',
    countdownNumber: 'text-rose-900',
    itineraryRow: 'border-rose-100 from-white to-orange-50',
    itineraryDot: 'bg-rose-600',
    giftBorder: 'border-rose-100',
    giftBg: 'bg-rose-50/70',
    giftLink: 'text-rose-700',
    footerTitle: 'text-orange-950',
    musicBtn: 'border-orange-200 hover:bg-orange-50',
    sparkleBtn:
      'bg-gradient-to-r from-orange-200 to-rose-300 hover:from-orange-300 hover:to-rose-400 text-rose-900 border-orange-200/80',
    subtitleAccent: 'text-purple-800',
    loadingBorder: 'border-rose-700',
    doveIcon: 'text-orange-700',
  },
  tropical: {
    pageBg: 'from-cyan-50 via-teal-50 to-emerald-50',
    heading: 'text-teal-950',
    subheading: 'text-teal-900/70',
    borderHero: 'border-teal-100',
    sectionBorder: 'border-teal-100',
    sectionTitle: 'text-teal-900',
    iconWrap: 'bg-teal-50 border-teal-100 text-teal-800',
    link: 'text-teal-700 font-semibold hover:underline',
    btnPrimary: 'bg-teal-800',
    btnPrimaryHover: 'hover:bg-teal-900',
    focusRing: 'focus:ring-teal-200',
    focusBorder: 'focus:border-teal-500',
    badgePill: 'bg-teal-700 text-white',
    countdownCell: 'from-teal-100 to-white border-teal-100',
    countdownNumber: 'text-teal-900',
    itineraryRow: 'border-teal-100 from-white to-teal-50',
    itineraryDot: 'bg-teal-600',
    giftBorder: 'border-cyan-100',
    giftBg: 'bg-cyan-50/70',
    giftLink: 'text-teal-700',
    footerTitle: 'text-teal-950',
    musicBtn: 'border-teal-200 hover:bg-teal-50',
    sparkleBtn:
      'bg-gradient-to-r from-cyan-200 to-teal-300 hover:from-cyan-300 hover:to-teal-400 text-teal-900 border-cyan-200/80',
    subtitleAccent: 'text-emerald-700',
    loadingBorder: 'border-teal-700',
    doveIcon: 'text-teal-700',
  },
  spring: {
    pageBg: 'from-pink-50 via-yellow-50 to-sky-50',
    heading: 'text-pink-950',
    subheading: 'text-pink-900/70',
    borderHero: 'border-pink-100',
    sectionBorder: 'border-pink-100',
    sectionTitle: 'text-pink-900',
    iconWrap: 'bg-pink-50 border-pink-100 text-pink-800',
    link: 'text-sky-700 font-semibold hover:underline',
    btnPrimary: 'bg-pink-800',
    btnPrimaryHover: 'hover:bg-pink-900',
    focusRing: 'focus:ring-pink-200',
    focusBorder: 'focus:border-pink-500',
    badgePill: 'bg-sky-700 text-white',
    countdownCell: 'from-pink-100 to-white border-pink-100',
    countdownNumber: 'text-pink-900',
    itineraryRow: 'border-sky-100 from-white to-pink-50',
    itineraryDot: 'bg-pink-600',
    giftBorder: 'border-yellow-100',
    giftBg: 'bg-yellow-50/80',
    giftLink: 'text-sky-700',
    footerTitle: 'text-pink-950',
    musicBtn: 'border-pink-200 hover:bg-pink-50',
    sparkleBtn:
      'bg-gradient-to-r from-yellow-200 to-pink-300 hover:from-yellow-300 hover:to-pink-400 text-pink-900 border-yellow-200/80',
    subtitleAccent: 'text-sky-800',
    loadingBorder: 'border-pink-700',
    doveIcon: 'text-pink-700',
  },
}

/** Mismo mapa que `isla/5` / Sanity `theme.fontFamily`. */
const fontFamilies: Record<string, string> = {
  sans: 'font-nunito',
  serif: 'font-serif',
  playfair: 'font-playfair',
  dancing: 'font-dancing',
  pacifico: 'font-pacifico',
  bebas: 'font-bebas',
  montserrat: 'font-montserrat',
  greatvibes: 'font-greatvibes',
  lobster: 'font-lobster',
  raleway: 'font-raleway',
}

function Icon({
  name,
  className = 'w-5 h-5',
}: {
  name:
    | 'countdown'
    | 'calendar'
    | 'location'
    | 'family'
    | 'schedule'
    | 'gallery'
    | 'gift'
    | 'mail'
    | 'check'
    | 'sparkle'
    | 'volume-on'
    | 'volume-off'
    | 'dove'
  className?: string
}) {
  const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

  if (name === 'countdown') {
    return <svg viewBox="0 0 24 24" className={className} {...base}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
  }
  if (name === 'calendar') {
    return <svg viewBox="0 0 24 24" className={className} {...base}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>
  }
  if (name === 'location') {
    return <svg viewBox="0 0 24 24" className={className} {...base}><path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>
  }
  if (name === 'family') {
    return <svg viewBox="0 0 24 24" className={className} {...base}><circle cx="8" cy="8" r="2.5" /><circle cx="16" cy="8" r="2.5" /><circle cx="12" cy="12" r="2.5" /><path d="M3.5 20c.3-2.8 2.4-4.5 4.5-4.5s4.2 1.7 4.5 4.5M11.5 20c.3-2.8 2.4-4.5 4.5-4.5s4.2 1.7 4.5 4.5" /></svg>
  }
  if (name === 'schedule') {
    return <svg viewBox="0 0 24 24" className={className} {...base}><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></svg>
  }
  if (name === 'gallery') {
    return <svg viewBox="0 0 24 24" className={className} {...base}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m21 16-5-5-4 4-2-2-4 3" /></svg>
  }
  if (name === 'gift') {
    return <svg viewBox="0 0 24 24" className={className} {...base}><path d="M20 12v8H4v-8M3 8h18v4H3zM12 8v12M12 8c-1.8 0-3.5-.9-3.5-2.5S10.2 3 12 8Zm0 0c1.8 0 3.5-.9 3.5-2.5S13.8 3 12 8Z" /></svg>
  }
  if (name === 'mail') {
    return <svg viewBox="0 0 24 24" className={className} {...base}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>
  }
  if (name === 'check') {
    return <svg viewBox="0 0 24 24" className={className} {...base}><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.4 2.4L15.7 9.6" /></svg>
  }
  if (name === 'sparkle') {
    return <svg viewBox="0 0 24 24" className={className} {...base}><path d="M12 3l1.6 4.2L18 9l-4.4 1.8L12 15l-1.6-4.2L6 9l4.4-1.8ZM5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8ZM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8Z" /></svg>
  }
  if (name === 'volume-on') {
    return <svg viewBox="0 0 24 24" className={className} {...base}><path d="M11 5 6.5 9H3v6h3.5L11 19zM15.5 9.5a4 4 0 0 1 0 5M18 7a7 7 0 0 1 0 10" /></svg>
  }
  if (name === 'volume-off') {
    return <svg viewBox="0 0 24 24" className={className} {...base}><path d="M11 5 6.5 9H3v6h3.5L11 19zM16 10l5 5M21 10l-5 5" /></svg>
  }
  if (name === 'dove') {
    return <svg viewBox="0 0 24 24" className={className} {...base}><path d="M4 14c3 0 4-2 5.5-3.5C11.5 8.5 14 8 16 9c1.4.7 2.5 2.1 2.5 3.8 0 2.6-2.3 4.7-5.3 4.7H10l-2.5 2.5-.2-2.2C5.6 17 4 15.7 4 14z" /><path d="M13 9.5c-.7-1.7-2.6-2.4-4.2-1.7" /></svg>
  }
  return <svg viewBox="0 0 24 24" className={className} {...base}><circle cx="12" cy="12" r="2" /></svg>
}

function SectionCard({
  title,
  icon,
  children,
  tone,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  tone: ThemeTone
}) {
  return (
    <section className={`rounded-3xl bg-white/90 border shadow-lg p-6 sm:p-8 ${tone.sectionBorder}`}>
      <h3 className={`text-3xl sm:text-4xl font-semibold mb-4 sm:mb-6 flex items-center gap-3 ${tone.sectionTitle}`}>
        {icon ? (
          <span className={`inline-flex items-center justify-center rounded-full w-9 h-9 ${tone.iconWrap}`}>{icon}</span>
        ) : null}
        {title}
      </h3>
      {children}
    </section>
  )
}

function Isla6Content() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const eventId = searchParams.get('eventId')
  const token = searchParams.get('token')

  const [eventData, setEventData] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false)
  const [rsvpForm, setRsvpForm] = useState({
    guestName: '',
    attending: true,
    numberOfGuests: 1,
    message: '',
  })

  useEffect(() => {
    const link = document.createElement('link')
    link.href =
      'https://fonts.googleapis.com/css2?family=Cormorant+Infant:wght@400;600;700&family=Nunito:wght@400;600;700;800&family=Playfair+Display:wght@400;700;900&family=Dancing+Script:wght@400;700&family=Pacifico&family=Bebas+Neue&family=Montserrat:wght@400;700;900&family=Great+Vibes&family=Lobster&family=Raleway:wght@400;700;900&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    return () => {
      link.parentNode?.removeChild(link)
    }
  }, [])

  useEffect(() => {
    async function fetchEvent() {
      if (!eventId) {
        setLoading(false)
        return
      }
      try {
        const response = await fetch(`/api/events/${eventId}`)
        if (!response.ok) {
          setLoading(false)
          return
        }
          const data = await response.json()
          setEventData(data)
      } catch (error) {
        console.error('Error fetching event:', error)
      } finally {
          setLoading(false)
        }
      }
    fetchEvent()
  }, [eventId])

  useEffect(() => {
    if (!eventData?.template) return
    if (eventData.template === 'isla/6') return
    const tokenQuery = token ? `&token=${encodeURIComponent(token)}` : ''
    router.replace(`/${eventData.template}?eventId=${eventData._id}${tokenQuery}`)
  }, [eventData, router, token])

  const eventDate = useMemo(
    () => (eventData?.eventDate ? new Date(eventData.eventDate) : new Date('2026-05-16T13:00:00')),
    [eventData?.eventDate]
  )

  const schemeKey = eventData?.theme?.colorScheme ?? 'ocean'
  const tone = useMemo(() => TONES[schemeKey] ?? TONES.ocean, [schemeKey])
  const fontKey = eventData?.theme?.fontFamily ?? 'sans'
  const fontClass = fontFamilies[fontKey] ?? fontFamilies.sans

  const title = eventData?.title || 'Nuestro Pequeño'
  const description = eventData?.description || 'Con mucho amor te invitamos a compartir este momento de fe y alegría.'

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now()
      const distance = eventDate.getTime() - now
      setTimeLeft({
        days: Math.max(0, Math.floor(distance / (1000 * 60 * 60 * 24))),
        hours: Math.max(0, Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))),
        minutes: Math.max(0, Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))),
        seconds: Math.max(0, Math.floor((distance % (1000 * 60)) / 1000)),
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [eventDate])

  const toggleMusic = () => {
    const audio = document.getElementById('background-music') as HTMLAudioElement | null
    if (!audio) return
      if (isPlaying) {
        audio.pause()
      } else {
        audio.play()
      }
      setIsPlaying(!isPlaying)
  }

  /** Confeti con intensidad gradual (mismo patrón que `isla/5`). */
  const launchSoftConfetti = () => {
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    }, 250)
  }

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: eventData?._id,
          ...rsvpForm,
        }),
        })
      if (response.ok) {
        setRsvpSubmitted(true)
        launchSoftConfetti()
      }
    } catch (error) {
      console.error('Error submitting RSVP:', error)
    }
  }

  if (loading && eventId) {
    return (
      <div className={`min-h-screen bg-gradient-to-b ${tone.pageBg} flex items-center justify-center ${fontClass}`}>
        <div className="text-center text-slate-700">
          <div className={`animate-spin rounded-full h-14 w-14 border-b-2 mx-auto mb-4 ${tone.loadingBorder}`} />
          <p>Cargando invitación...</p>
        </div>
      </div>
    )
  }

  const mainLocation = eventData?.location
  const mapsHref = mainLocation?.coordinates
    ? `https://www.google.com/maps/search/?api=1&query=${mainLocation.coordinates.lat},${mainLocation.coordinates.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${mainLocation?.venueName || ''}, ${mainLocation?.address || ''}, ${mainLocation?.city || ''}, ${mainLocation?.state || ''}`
      )}`

  return (
    <div className={`min-h-screen bg-gradient-to-b ${tone.pageBg} text-slate-800 antialiased ${fontClass}`}>
      {eventData?.backgroundMusic?.asset?.url && (
        <>
          <audio id="background-music" src={eventData.backgroundMusic.asset.url} loop preload="auto" />
          <button
            type="button"
            onClick={toggleMusic}
            className={`fixed right-6 bottom-6 z-50 rounded-full bg-white border p-4 shadow-lg ${tone.musicBtn}`}
            aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
          >
            {isPlaying ? <Icon name="volume-on" className="w-5 h-5" /> : <Icon name="volume-off" className="w-5 h-5" />}
          </button>
        </>
      )}

      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8 sm:space-y-10">
        <section className={`relative rounded-[2rem] overflow-hidden border shadow-xl ${tone.borderHero}`}>
          <div className="relative p-6 sm:p-10 md:p-14 text-center bg-white/55 backdrop-blur-[1px]">
            <p className={`text-lg sm:text-xl tracking-[0.2em] uppercase ${tone.subheading}`}>
              Invitación Especial
            </p>
            <div className={`mt-4 mb-2 flex justify-center ${tone.doveIcon}`}>
              {eventData?.customIcon ? '' : <Icon name="dove" className="w-16 h-16 sm:w-20 sm:h-20" />}
            </div>
            {eventData?.customIcon && (
              <img
                src={urlFor(eventData.customIcon).width(180).height(180).url()}
                alt="Icono del evento"
                className="mx-auto mb-3 h-24 w-24 sm:h-32 sm:w-32 object-contain"
              />
            )}
            <h1 className={`text-5xl sm:text-6xl md:text-7xl font-bold ${tone.heading}`}>{title}</h1>
            <p className="text-base sm:text-lg max-w-2xl mx-auto mt-4 text-slate-700">{description}</p>
            <p className={`text-2xl sm:text-3xl mt-6 ${tone.subtitleAccent}`}>
              {eventData?.eventType === 'baptism'
                ? 'Te invitamos a celebrar su Sagrado Bautizo'
                : 'Te invitamos a celebrar con nosotros'}
            </p>
        </div>
          {eventData?.heroImage && (
            <img
              src={urlFor(eventData.heroImage).width(1600).height(900).url()}
              alt={title}
              className="w-full aspect-[16/10] object-cover object-[50%_35%]"
              loading="lazy"
              decoding="async"
            />
          )}
        </section>

        {eventData?.showCountdown !== false && (
          <SectionCard title="Cuenta Regresiva" tone={tone} icon={<Icon name="countdown" className="w-5 h-5" />}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Días', value: timeLeft.days },
                { label: 'Horas', value: timeLeft.hours },
                { label: 'Minutos', value: timeLeft.minutes },
                { label: 'Segundos', value: timeLeft.seconds },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-2xl bg-gradient-to-b p-4 text-center border ${tone.countdownCell}`}
                >
                  <p className={`text-4xl font-bold ${tone.countdownNumber}`}>{item.value}</p>
                  <p className="text-sm uppercase tracking-wide text-slate-600">{item.label}</p>
                  </div>
                ))}
              </div>
          </SectionCard>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <SectionCard title="Fecha y Hora" tone={tone} icon={<Icon name="calendar" className="w-5 h-5" />}>
            <p className="text-lg text-slate-700">
              {eventDate.toLocaleDateString('es-MX', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className={`text-4xl mt-2 ${tone.countdownNumber}`}>
              {eventData?.location?.time ||
                eventDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </p>
          </SectionCard>

          <SectionCard title="Ubicación Principal" tone={tone} icon={<Icon name="location" className="w-5 h-5" />}>
            <p className="font-bold text-lg">{mainLocation?.venueName || 'Lugar por confirmar'}</p>
            <p className="text-slate-700">{mainLocation?.address}</p>
            <p className="text-slate-700">
              {mainLocation?.city} {mainLocation?.state ? `, ${mainLocation.state}` : ''}
            </p>
            <a href={mapsHref} target="_blank" rel="noopener noreferrer" className={`inline-block mt-4 ${tone.link}`}>
              Ver cómo llegar →
            </a>
          </SectionCard>
              </div>

        {(eventData?.parents?.father || eventData?.parents?.mother || (eventData?.godparents && eventData.godparents.length > 0)) && (
          <SectionCard title="Familia" tone={tone} icon={<Icon name="family" className="w-5 h-5" />}>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className={`text-2xl mb-2 ${tone.sectionTitle}`}>Padres</p>
                {eventData?.parents?.father && <p>{eventData.parents.father}</p>}
                {eventData?.parents?.mother && <p>{eventData.parents.mother}</p>}
                  </div>
              <div>
                <p className={`text-2xl mb-2 ${tone.sectionTitle}`}>Padrinos</p>
                <div className="space-y-2">
                  {eventData?.godparents?.map((gp, index) => (
                    <p key={index}>
                      <span className="font-semibold">{gp.type || 'Padrino/Madrina'}:</span> {gp.name}
                    </p>
                ))}
              </div>
            </div>
          </div>
          </SectionCard>
        )}

        {eventData?.itinerary && eventData.itinerary.length > 0 && (
          <SectionCard title="Orden del Día" tone={tone} icon={<Icon name="schedule" className="w-5 h-5" />}>
            <ol className="space-y-3">
                {eventData.itinerary.map((item, index) => (
                <li key={index} className={`rounded-2xl border p-4 bg-gradient-to-r ${tone.itineraryRow}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold">
                      <span className="inline-flex items-center gap-2">
                        {item.icon ? <span>{item.icon}</span> : <span className={`inline-block w-1.5 h-1.5 rounded-full ${tone.itineraryDot}`} />}
                        {item.activity || 'Actividad'}
                      </span>
                    </p>
                    <span className={`text-sm px-3 py-1 rounded-full font-medium ${tone.badgePill}`}>{item.time || '--:--'}</span>
                      </div>
                  {item.description && <p className="text-slate-600 mt-2">{item.description}</p>}
                </li>
              ))}
            </ol>
          </SectionCard>
        )}

        {eventData?.gallery && eventData.gallery.length > 0 && (
          <SectionCard title="Galería" tone={tone} icon={<Icon name="gallery" className="w-5 h-5" />}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {eventData.gallery.map((photo, index) => (
                <div key={index} className={`overflow-hidden rounded-2xl border bg-white ${tone.sectionBorder}`}>
                  <img src={urlFor(photo).width(500).height(350).url()} alt={photo.caption || `Foto ${index + 1}`} className="w-full h-44 object-cover" />
                  {photo.caption && <p className="text-sm p-3 text-slate-700">{photo.caption}</p>}
                  </div>
                ))}
              </div>
          </SectionCard>
        )}

        {eventData?.giftRegistry?.enabled && (
          <SectionCard title="Mesa de Regalos" tone={tone} icon={<Icon name="gift" className="w-5 h-5" />}>
            {eventData.giftRegistry.message && <p className="text-slate-700 mb-4">{eventData.giftRegistry.message}</p>}
              {eventData.giftRegistry.stores && eventData.giftRegistry.stores.length > 0 && (
              <div className="space-y-3 mb-4">
                  {eventData.giftRegistry.stores.map((store, index) => (
                  <div key={index} className={`rounded-2xl border p-4 ${tone.giftBorder} ${tone.giftBg}`}>
                    <p className="font-bold">{store.name}</p>
                    {store.code && <p className="text-sm">Código: {store.code}</p>}
                      {store.url && (
                      <a href={store.url} target="_blank" rel="noopener noreferrer" className={`hover:underline text-sm ${tone.giftLink}`}>
                        Ver mesa →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
          </SectionCard>
        )}

        {eventData?.rsvpEnabled !== false && (
          <SectionCard title="Confirmación de Asistencia" tone={tone} icon={<Icon name="mail" className="w-5 h-5" />}>
              {rsvpSubmitted ? (
              <div className="text-center py-6">
                <p className="text-green-700 flex justify-center mb-2">
                  <Icon name="check" className="w-10 h-10" />
                </p>
                <p className="text-lg font-bold text-green-700">¡Gracias por confirmar!</p>
                </div>
              ) : (
              <form onSubmit={handleRsvpSubmit} className="space-y-4">
                    <input
                      type="text"
                      required
                      value={rsvpForm.guestName}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, guestName: e.target.value })}
                  className={`w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 ${tone.focusRing} ${tone.focusBorder}`}
                  placeholder="Nombre completo"
                />
                <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                    onClick={() => setRsvpForm({ ...rsvpForm, attending: true })}
                    className={`rounded-xl px-4 py-3 font-bold ${
                      rsvpForm.attending ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Sí asistiré
                      </button>
                      <button
                        type="button"
                    onClick={() => setRsvpForm({ ...rsvpForm, attending: false })}
                    className={`rounded-xl px-4 py-3 font-bold ${
                      !rsvpForm.attending ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    No podré
                      </button>
                    </div>
                  {rsvpForm.attending && (
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={rsvpForm.numberOfGuests}
                    onChange={(e) => setRsvpForm({ ...rsvpForm, numberOfGuests: parseInt(e.target.value || '1', 10) })}
                    className={`w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 ${tone.focusRing} ${tone.focusBorder}`}
                    placeholder="Número de personas"
                      />
                  )}
                    <textarea
                      rows={4}
                  value={rsvpForm.message}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, message: e.target.value })}
                  className={`w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 ${tone.focusRing} ${tone.focusBorder}`}
                  placeholder="Mensaje (opcional)"
                />
                  <button
                    type="submit"
                  className={`w-full rounded-xl text-white py-3 font-bold ${tone.btnPrimary} ${tone.btnPrimaryHover}`}
                  >
                  Enviar confirmación
                  </button>
                </form>
              )}
          </SectionCard>
        )}

        <footer className="text-center pt-4 pb-8">
          <p className={`mt-4 text-3xl ${tone.footerTitle}`}>¡Te esperamos con mucho cariño!</p>
        </footer>
      </main>

      <button
        type="button"
        onClick={launchSoftConfetti}
        className={`fixed bottom-20 sm:bottom-24 right-6 sm:right-8 z-50 bg-gradient-to-r font-semibold p-3 sm:p-4 rounded-full shadow-lg border transition-all transform hover:scale-110 active:scale-95 ${tone.sparkleBtn}`}
        aria-label="Lanzar brillos"
      >
        <Icon name="sparkle" className="w-5 h-5" />
      </button>

      <style jsx global>{`
        .font-nunito {
          font-family: 'Nunito', system-ui, sans-serif;
        }
        .font-playfair {
          font-family: 'Playfair Display', serif;
        }
        .font-dancing {
          font-family: 'Dancing Script', cursive;
        }
        .font-pacifico {
          font-family: 'Pacifico', cursive;
        }
        .font-bebas {
          font-family: 'Bebas Neue', sans-serif;
          letter-spacing: 0.05em;
        }
        .font-montserrat {
          font-family: 'Montserrat', sans-serif;
        }
        .font-greatvibes {
          font-family: 'Great Vibes', cursive;
        }
        .font-lobster {
          font-family: 'Lobster', cursive;
        }
        .font-raleway {
          font-family: 'Raleway', sans-serif;
        }
      `}</style>
    </div>
  )
}


export default function Isla6() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-14 w-14 border-b-2 border-sky-700" /></div>}>
      <Isla6Content />
    </Suspense>
  )
}
