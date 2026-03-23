'use client'

// Force dynamic rendering since we use searchParams
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { urlFor } from '@/lib/sanity'
import confetti from 'canvas-confetti'

interface EventData {
  _id: string
  title: string
  description: string
  eventDate: string
  template?: string
  eventType?: string
  customIcon?: any
  heroImage?: any
  gallery?: Array<{ asset: any; caption?: string }>
  backgroundMusic?: { asset: { url: string } }
  showCountdown?: boolean
  theme?: {
    colorScheme?: string
    fontFamily?: string
  }
  itinerary?: Array<{ time: string; activity: string; description?: string; icon?: string }>
  parents?: { father?: string; mother?: string }
  godparents?: Array<{ type: string; name: string }>
  location: {
    venueName: string
    address: string
    city: string
    state: string
    time?: string
    coordinates?: { lat: number; lng: number }
  }
  giftRegistry?: {
    enabled: boolean
    message?: string
    stores?: Array<{ name: string; code?: string; url?: string }>
    cashGift?: {
      enabled: boolean
      bankName?: string
      accountNumber?: string
      clabe?: string
      accountHolder?: string
    }
  }
  contactInfo: {
    whatsapp: string
  }
  rsvpEnabled?: boolean
  rsvpDeadline?: string
}

// Mapeo de esquemas de color
const colorSchemes = {
  rainbow: 'from-indigo-500 via-purple-500 to-pink-500',
  ocean: 'from-blue-400 via-blue-500 to-cyan-500',
  purple: 'from-purple-600 via-purple-500 to-purple-400',
  pink: 'from-pink-400 via-pink-500 to-rose-500',
  orange: 'from-orange-400 via-orange-500 to-amber-500',
  green: 'from-emerald-400 via-green-500 to-teal-500',
  red: 'from-red-500 via-rose-500 to-pink-500',
  black: 'from-gray-800 via-gray-900 to-black',
  white: 'from-gray-100 via-white to-gray-50',
  sunset: 'from-orange-400 via-pink-500 to-purple-500',
  tropical: 'from-cyan-400 via-teal-500 to-green-500',
  spring: 'from-pink-300 via-rose-400 to-yellow-300',
}

// Mapeo de fuentes
const fontFamilies = {
  sans: '',
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

export default function Isla5() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId')
  const token = searchParams.get('token')
  const router = useRouter()
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [rsvpForm, setRsvpForm] = useState({
    guestName: '',
    attending: true,
    numberOfGuests: 1,
    message: ''
  })

  // Intersection Observer para animaciones de scroll
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-visible')
          observer.unobserve(entry.target)
        }
      })
    }, observerOptions)

    // Observar todos los elementos con la clase scroll-reveal
    const elements = document.querySelectorAll('.scroll-reveal')
    elements.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [loading, eventData])

  useEffect(() => {
    async function fetchEvent() {
      if (!eventId) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/events/${eventId}`)
        if (response.ok) {
          const data = await response.json()
          setEventData(data)
          
          // Pequeño delay para mostrar el mensaje personalizado
          setTimeout(() => {
            setLoading(false)
          }, 800)
        } else {
          setLoading(false)
        }
      } catch (err) {
        console.error('Error fetching event:', err)
        setLoading(false)
      }
    }

    fetchEvent()
  }, [eventId])

  // Si el usuario está viendo una URL de template distinta a la que indica Sanity,
  // redirigimos automáticamente para reflejar el `event.template` actualizado.
  useEffect(() => {
    if (!eventData?.template) return
    if (eventData.template === 'isla/5') return

    const tokenQuery = token ? `&token=${encodeURIComponent(token)}` : ''
    router.replace(`/${eventData.template}?eventId=${eventData._id}${tokenQuery}`)
  }, [eventData, router, token])

  // Cargar Google Fonts dinámicamente
  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Dancing+Script:wght@400;700&family=Pacifico&family=Bebas+Neue&family=Montserrat:wght@400;700;900&family=Great+Vibes&family=Lobster&family=Raleway:wght@400;700;900&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    
    return () => {
      document.head.removeChild(link)
    }
  }, [])

  // Efecto de confeti al cargar
  useEffect(() => {
    if (!loading && eventData) {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      }, 500)
    }
  }, [loading, eventData])

  // Control de música de fondo
  const toggleMusic = () => {
    const audio = document.getElementById('background-music') as HTMLAudioElement
    if (audio) {
      if (isPlaying) {
        audio.pause()
      } else {
        audio.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Función para lanzar confeti
  const launchConfetti = () => {
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
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
          ...rsvpForm
        })
      })

      if (response.ok) {
        setRsvpSubmitted(true)
        launchConfetti()
      }
    } catch (error) {
      console.error('Error submitting RSVP:', error)
    }
  }

  // Datos por defecto o dinámicos
  const title = eventData?.title || 'Diego Cruz'
  const description = eventData?.description || '¡Celebremos juntos!'
  const eventDate = eventData?.eventDate ? new Date(eventData.eventDate) : new Date('2026-01-18T16:00:00')
  const dayOfWeek = eventDate.toLocaleDateString('es-MX', { weekday: 'long' })
  const day = eventDate.getDate()
  const month = eventDate.toLocaleDateString('es-MX', { month: 'long' })
  const time = eventData?.location?.time || eventDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true })
  const venueName = eventData?.location?.venueName || 'Col. El Huizache'
  const address = eventData?.location?.address || 'S/N'
  const city = eventData?.location?.city || 'Pedro Escobedo'
  const state = eventData?.location?.state || 'Querétaro'

  // Obtener tema personalizado
  const colorScheme = eventData?.theme?.colorScheme || 'rainbow'
  const fontFamily = eventData?.theme?.fontFamily || 'sans'
  const bgGradient = colorSchemes[colorScheme as keyof typeof colorSchemes] || colorSchemes.rainbow
  const fontClass = fontFamilies[fontFamily as keyof typeof fontFamilies] || ''

  // Calcular tiempo restante
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = eventDate.getTime() - now

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [eventDate])

  if (loading && eventId) {
    const eventTitle = eventData?.title || ''
    const eventType = eventData?.eventType || ''
    
    // Traducir tipo de evento
    const eventTypeMap: Record<string, string> = {
      wedding: 'la boda de',
      quinceanera: 'los XV años de',
      birthday: 'el cumpleaños de',
      baptism: 'el bautizo de',
      other: ''
    }
    const eventTypeText = eventTypeMap[eventType] || ''
    
    return (
      <div className={`flex items-center justify-center min-h-screen bg-gradient-to-br ${bgGradient} ${fontClass}`}>
        <div className="text-center text-white px-4 max-w-2xl">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-white mx-auto mb-4"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 border-4 border-white opacity-20 mx-auto"></div>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 animate-pulse drop-shadow-lg">
            {eventTitle ? (
              <>¡Estás invitado a {eventTypeText} <span className="text-yellow-300">{eventTitle}</span>!</>
            ) : (
              '¡Estás invitado!'
            )}
          </h2>
          <p className="text-lg sm:text-xl opacity-90">
            {eventTitle ? 'Preparando los detalles...' : 'Cargando invitación...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} relative overflow-hidden ${fontClass}`}>
      {/* Textura de fondo sutil */}
      <div className="absolute inset-0 opacity-30 bg-texture"></div>
      
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-300 opacity-10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-300 opacity-10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Música de Fondo */}
      {eventData?.backgroundMusic?.asset?.url && (
        <>
          <audio
            id="background-music"
            src={eventData.backgroundMusic.asset.url}
            loop
            preload="auto"
          />
          <button
            onClick={toggleMusic}
            className="fixed bottom-6 sm:bottom-8 right-6 sm:right-8 z-50 bg-white hover:bg-gray-100 text-purple-600 font-bold p-3 sm:p-4 md:p-5 rounded-full shadow-2xl transition-all transform hover:scale-110 hover:rotate-12 active:scale-95"
            aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
          >
            {isPlaying ? (
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </>
      )}

      {/* Botón de confeti flotante */}
      <button
        onClick={launchConfetti}
        className="fixed bottom-20 sm:bottom-24 right-6 sm:right-8 z-50 bg-gradient-to-r from-yellow-400 to-pink-500 hover:from-yellow-500 hover:to-pink-600 text-white font-bold p-3 sm:p-4 md:p-5 rounded-full shadow-2xl transition-all transform hover:scale-110 hover:rotate-12 active:scale-95"
        aria-label="Lanzar confeti"
      >
        <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
        </svg>
      </button>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Hero Section con imagen */}
        {eventData?.heroImage && (
          <div className="mb-12 scroll-reveal">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
              <img 
                src={urlFor(eventData.heroImage).width(800).url()} 
                alt={title}
                className="relative w-full max-w-2xl mx-auto rounded-3xl shadow-2xl transform transition duration-500 hover:scale-105"
              />
            </div>
          </div>
        )}

        {/* Título principal con animación */}
        <div className="text-center text-white mb-12 scroll-reveal">
          <div className="inline-block animate-bounce-slow">
            {eventData?.customIcon ? (
              <img 
                src={urlFor(eventData.customIcon).width(300).height(300).url()} 
                alt="Icono del evento"
                className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 mx-auto mb-4 sm:mb-6 drop-shadow-2xl object-contain"
              />
            ) : (
              <h1 className="text-5xl sm:text-7xl md:text-9xl font-bold mb-4 sm:mb-6 drop-shadow-2xl">
                🎉
              </h1>
            )}
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-extrabold mb-3 sm:mb-4 drop-shadow-lg animate-slide-in-left px-4">
            ¡Estás Invitado!
          </h2>
          <p className="text-xl sm:text-2xl md:text-4xl mb-4 sm:mb-6 font-light animate-slide-in-right px-4">
            {description}
          </p>
          <h3 className="text-4xl sm:text-6xl md:text-8xl font-black mb-6 sm:mb-8 text-yellow-300 drop-shadow-2xl animate-pulse-slow px-4">
            {title}
          </h3>
        </div>

        {/* Contador Regresivo mejorado */}
        {(eventData?.showCountdown !== false) && (
          <div className="max-w-4xl mx-auto mb-12 scroll-reveal">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-4 sm:p-8 transform transition duration-500 hover:scale-105 border border-white/20">
              <h4 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 sm:mb-8">
                ⏰ Cuenta Regresiva
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
                {[
                  { value: timeLeft.days, label: 'Días', color: 'from-blue-500 to-blue-600' },
                  { value: timeLeft.hours, label: 'Horas', color: 'from-purple-500 to-purple-600' },
                  { value: timeLeft.minutes, label: 'Minutos', color: 'from-pink-500 to-pink-600' },
                  { value: timeLeft.seconds, label: 'Segundos', color: 'from-red-500 to-red-600' }
                ].map((item, index) => (
                  <div key={index} className="transform transition duration-300 hover:scale-110">
                    <div className={`bg-gradient-to-br ${item.color} text-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg`}>
                      <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-1 sm:mb-2">{item.value}</div>
                      <div className="text-xs sm:text-sm md:text-base font-semibold uppercase tracking-wider">{item.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Fecha y Hora mejorada */}
        <div className="max-w-2xl mx-auto mb-12 scroll-reveal">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-10 transform transition duration-500 hover:scale-105 border border-white/20">
            <div className="text-center">
              <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full mb-4 sm:mb-6 shadow-lg">
                <p className="text-lg sm:text-xl md:text-2xl font-bold uppercase tracking-wide">
                  {dayOfWeek}
                </p>
              </div>
              <div className="relative inline-block">
                <div className="text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4">
                  {day}
                </div>
              </div>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 mb-6 sm:mb-8 uppercase">
                {month}
              </p>
              <div className="border-t-4 border-gradient-to-r from-purple-400 to-pink-400 pt-4 sm:pt-6">
                <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-2 sm:mb-3 font-semibold">A partir de las</p>
                <p className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">{time}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Padres */}
        {eventData?.parents && (eventData.parents.father || eventData.parents.mother) && (
          <div className="max-w-2xl mx-auto mb-12 scroll-reveal">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-8 transform transition duration-500 hover:scale-105 border border-white/20">
              <h4 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 sm:mb-6 px-4">
                👨‍👩‍👦 Con la bendición de
              </h4>
              <div className="text-center space-y-2 sm:space-y-3 px-4">
                {eventData.parents.father && (
                  <p className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">{eventData.parents.father}</p>
                )}
                {eventData.parents.mother && (
                  <p className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">{eventData.parents.mother}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Padrinos */}
        {eventData?.godparents && eventData.godparents.length > 0 && (
          <div className="max-w-2xl mx-auto mb-12 scroll-reveal">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-8 transform transition duration-500 hover:scale-105 border border-white/20">
              <h4 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 sm:mb-8 px-4">
                🤝 Padrinos
              </h4>
              <div className="space-y-4 sm:space-y-6">
                {eventData.godparents.map((godparent, index) => (
                  <div key={index} className="text-center p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl mx-4">
                    <p className="text-base sm:text-lg font-bold text-purple-600 mb-1">{godparent.type}</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">{godparent.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Itinerario */}
        {eventData?.itinerary && eventData.itinerary.length > 0 && (
          <div className="max-w-3xl mx-auto mb-12 scroll-reveal">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-8 transform transition duration-500 hover:scale-105 border border-white/20">
              <h4 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 sm:mb-8 px-4">
                📋 Programa del Evento
              </h4>
              <div className="space-y-3 sm:space-y-4">
                {eventData.itinerary.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl transform transition duration-300 hover:scale-105 hover:shadow-lg mx-2">
                    <div className="text-3xl sm:text-4xl md:text-5xl flex-shrink-0">{item.icon || '⭐'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                        <h5 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">{item.activity}</h5>
                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap self-start">{item.time}</span>
                      </div>
                      {item.description && (
                        <p className="text-sm sm:text-base text-gray-600">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Ubicación mejorada */}
        <div className="max-w-2xl mx-auto mb-12 scroll-reveal">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-8 transform transition duration-500 hover:scale-105 border border-white/20">
            <h4 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 sm:mb-8 px-4">
              📍 Ubicación
            </h4>
            <div className="text-center px-4">
              <div className="mb-4 sm:mb-6">
                <p className="text-2xl sm:text-3xl font-black text-gray-800 mb-2 sm:mb-3">{venueName}</p>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-1 sm:mb-2">{address}</p>
                <p className="text-base sm:text-lg md:text-xl text-gray-600">{city}, {state}</p>
              </div>
              <a
                href={
                  eventData?.location?.coordinates
                    ? `https://www.google.com/maps/search/?api=1&query=${eventData.location.coordinates.lat},${eventData.location.coordinates.lng}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venueName}, ${address}, ${city}, ${state}`)}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 sm:py-4 px-8 sm:px-10 rounded-full transition-all shadow-lg transform hover:scale-110 hover:-translate-y-1 text-base sm:text-lg md:text-xl"
              >
                🗺️ Cómo Llegar
              </a>
            </div>
          </div>
        </div>

        {/* Galería mejorada */}
        {eventData?.gallery && eventData.gallery.length > 0 && (
          <div className="max-w-5xl mx-auto mb-12 scroll-reveal">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
              <h4 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 sm:mb-8 px-4">
                📸 Galería de Momentos
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {eventData.gallery.map((photo, index) => (
                  <div key={index} className="group relative overflow-hidden rounded-2xl shadow-lg transform transition duration-500 hover:scale-105 hover:shadow-2xl">
                    <img 
                      src={urlFor(photo).width(400).height(300).url()} 
                      alt={photo.caption || `Foto ${index + 1}`}
                      className="w-full h-56 object-cover transition duration-500 group-hover:scale-110"
                    />
                    {photo.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <p className="text-white text-sm font-semibold">{photo.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mesa de Regalos mejorada */}
        {eventData?.giftRegistry?.enabled && (
          <div className="max-w-2xl mx-auto mb-12 scroll-reveal">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 transform transition duration-500 hover:scale-105 border border-white/20">
              <h4 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 sm:mb-6 px-4">
                🎁 Mesa de Regalos
              </h4>
              {eventData.giftRegistry.message && (
                <p className="text-center text-gray-700 text-lg mb-8 italic">{eventData.giftRegistry.message}</p>
              )}
              
              {eventData.giftRegistry.stores && eventData.giftRegistry.stores.length > 0 && (
                <div className="space-y-4 mb-6">
                  {eventData.giftRegistry.stores.map((store, index) => (
                    <div key={index} className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl transform transition duration-300 hover:scale-105 hover:shadow-lg">
                      <h5 className="font-bold text-2xl text-gray-800 mb-3">{store.name}</h5>
                      {store.code && <p className="text-gray-700 mb-2 text-lg">Código: <span className="font-bold">{store.code}</span></p>}
                      {store.url && (
                        <a 
                          href={store.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block mt-2 text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                        >
                          Ver mesa de regalos →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {eventData.giftRegistry.cashGift?.enabled && (
                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                  <h5 className="font-bold text-2xl text-gray-800 mb-4 flex items-center justify-center gap-2">
                    <span>💵</span> Regalo en Efectivo
                  </h5>
                  <div className="space-y-2 text-gray-700">
                    {eventData.giftRegistry.cashGift.bankName && (
                      <p><span className="font-semibold">Banco:</span> {eventData.giftRegistry.cashGift.bankName}</p>
                    )}
                    {eventData.giftRegistry.cashGift.accountHolder && (
                      <p><span className="font-semibold">Titular:</span> {eventData.giftRegistry.cashGift.accountHolder}</p>
                    )}
                    {eventData.giftRegistry.cashGift.accountNumber && (
                      <p><span className="font-semibold">Cuenta:</span> {eventData.giftRegistry.cashGift.accountNumber}</p>
                    )}
                    {eventData.giftRegistry.cashGift.clabe && (
                      <p><span className="font-semibold">CLABE:</span> {eventData.giftRegistry.cashGift.clabe}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Confirmación de Asistencia mejorada */}
        {eventData?.rsvpEnabled !== false && (
          <div className="max-w-2xl mx-auto mb-12 scroll-reveal">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 transform transition duration-500 hover:scale-105 border border-white/20">
              <h4 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 sm:mb-8 px-4">
                ✉️ Confirma tu Asistencia
              </h4>
              
              {rsvpSubmitted ? (
                <div className="text-center py-12">
                  <div className="text-8xl mb-6 animate-bounce">✅</div>
                  <p className="text-3xl font-bold text-green-600 mb-4">
                    ¡Gracias por confirmar!
                  </p>
                  <p className="text-xl text-gray-600">
                    Nos vemos en la celebración 🎊
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRsvpSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 font-bold mb-3 text-lg">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={rsvpForm.guestName}
                      onChange={(e) => setRsvpForm({...rsvpForm, guestName: e.target.value})}
                      className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all text-lg"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-3 text-lg">
                      ¿Asistirás? *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setRsvpForm({...rsvpForm, attending: true})}
                        className={`py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
                          rsvpForm.attending
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        ✅ Sí, asistiré
                      </button>
                      <button
                        type="button"
                        onClick={() => setRsvpForm({...rsvpForm, attending: false})}
                        className={`py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
                          !rsvpForm.attending
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg scale-105'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        ❌ No podré asistir
                      </button>
                    </div>
                  </div>

                  {rsvpForm.attending && (
                    <div>
                      <label className="block text-gray-700 font-bold mb-3 text-lg">
                        Número de personas
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={rsvpForm.numberOfGuests}
                        onChange={(e) => setRsvpForm({...rsvpForm, numberOfGuests: parseInt(e.target.value)})}
                        className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all text-lg"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-700 font-bold mb-3 text-lg">
                      Mensaje (opcional)
                    </label>
                    <textarea
                      value={rsvpForm.message}
                      onChange={(e) => setRsvpForm({...rsvpForm, message: e.target.value})}
                      rows={4}
                      className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all text-lg"
                      placeholder="Déjanos un mensaje especial..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-5 rounded-xl transition-all shadow-lg transform hover:scale-105 hover:-translate-y-1 text-xl"
                  >
                    Enviar Confirmación 🎉
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Agregar al Calendario mejorado */}
        <div className="max-w-2xl mx-auto text-center mb-12 scroll-reveal px-4">
          <a
            href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Cumpleaños de ${title}`)}&dates=${eventDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${eventDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(description)}&location=${encodeURIComponent(`${venueName}, ${address}, ${city}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white hover:bg-gray-50 text-purple-600 font-bold py-3 sm:py-4 md:py-5 px-6 sm:px-8 md:px-10 rounded-full transition-all shadow-2xl transform hover:scale-110 hover:-translate-y-1 text-base sm:text-lg md:text-xl"
          >
            📅 Agregar a mi Calendario
          </a>
        </div>

        {/* Footer mejorado */}
        <div className="text-center text-white mt-16 sm:mt-20 pb-8 px-4">
          <p className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 drop-shadow-lg">¡Te esperamos! 🎊</p>
          <p className="text-base sm:text-lg opacity-80">Será un día inolvidable</p>
        </div>
      </div>

      <style jsx global>{`
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
        
        /* Textura de fondo sutil */
        .bg-texture {
          background-image: 
            radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.4) 2px, transparent 2px),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.3) 2px, transparent 2px),
            radial-gradient(circle at 40% 20%, rgba(255, 255, 255, 0.35) 1.5px, transparent 1.5px),
            radial-gradient(circle at 90% 40%, rgba(255, 255, 255, 0.3) 1.5px, transparent 1.5px),
            radial-gradient(circle at 10% 90%, rgba(255, 255, 255, 0.35) 2px, transparent 2px),
            radial-gradient(circle at 60% 60%, rgba(255, 255, 255, 0.25) 1px, transparent 1px);
          background-size: 60px 60px, 90px 90px, 120px 120px, 70px 70px, 100px 100px, 50px 50px;
          background-position: 0 0, 40px 60px, 130px 270px, 70px 100px, 20px 50px, 80px 30px;
        }
        
        /* Patrón alternativo de líneas diagonales sutiles */
        .bg-texture::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 15px,
            rgba(255, 255, 255, 0.08) 15px,
            rgba(255, 255, 255, 0.08) 30px
          );
        }
        
        /* Patrón de cuadrícula adicional */
        .bg-texture::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 100px 100px;
        }
        
        /* Scroll Reveal Animations */
        .scroll-reveal {
          opacity: 0;
          transform: translateY(50px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        
        .scroll-reveal.animate-visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        /* Variaciones de animación con delays */
        .scroll-reveal:nth-child(1) {
          transition-delay: 0s;
        }
        .scroll-reveal:nth-child(2) {
          transition-delay: 0.1s;
        }
        .scroll-reveal:nth-child(3) {
          transition-delay: 0.2s;
        }
        .scroll-reveal:nth-child(4) {
          transition-delay: 0.3s;
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
