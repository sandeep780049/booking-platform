import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  lazy,
  Suspense,
} from 'react';
import { useNetworkQuality } from '../hooks/useNetworkQuality';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import {
  Users,
  UserPlus,
  UserX,
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useAdventures } from '../hooks/useAdventure';
import { useLocations } from '../hooks/useLocation';
import { Nav_Landing } from '../components/Nav_Landing';
import { Footer } from '../components/Footer';

import { useFriend } from '../hooks/useFriend.jsx';
import { useEvents } from '../hooks/useEvent';
import { useEventBooking } from '../hooks/useEventBooking';
import { useGroupManagement } from '../hooks/useGroupManagement';
import { useCountrySlider } from '../hooks/useCountrySlider';

const EventCard = lazy(() => import('../components/events/EventCard'));
const SearchBar = lazy(() => import('../components/search/SearchBar'));
const PaginationComponent = lazy(
  () => import('../components/ui/PaginationComponent')
);

import { validateSearchForm } from '../utils/validationUtils';
import { formatDateWithWeekday } from '../utils/dateUtils';

const VIDEO_SOURCES = {
  low: 'https://cdn.jsdelivr.net/gh/Adnan2k5/booking-assets@main/landing.mp4',
  medium: 'https://cdn.jsdelivr.net/gh/Adnan2k5/booking-assets@main/landing.mp4',
  high: 'https://cdn.jsdelivr.net/gh/Adnan2k5/booking-assets@main/landing.mp4',
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const heroRef = useRef(null);
  const { t } = useTranslation();
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [adventure, setAdventure] = useState('');
  const [eventsPage, setEventsPage] = useState(1);

  const eventsLimit = 6;

  const {
    events,
    isLoading: eventsLoading,
    totalPages: eventsTotalPages,
  } = useEvents({
    page: eventsPage,
    limit: eventsLimit,
    defer: false,
  });

  const { adventures, loading: adventureLoading } = useAdventures(true);
  const { locations: allLocations, isLoading: locationsLoading } =
    useLocations(true);

  const eventBooking = useEventBooking();

  const groupManagement = useGroupManagement(user, useFriend, t);

  const countrySlider = useCountrySlider(events);
  const sliderDirectionRef = useRef(1);

  const handleNextCountry = useCallback(() => {
    sliderDirectionRef.current = 1;
    countrySlider.nextCountry();
  }, [countrySlider]);

  const handlePrevCountry = useCallback(() => {
    sliderDirectionRef.current = -1;
    countrySlider.prevCountry();
  }, [countrySlider]);

  const handleGoToCountry = useCallback((index, userInitiated) => {
    sliderDirectionRef.current = index > countrySlider.currentCountryIndex ? 1 : -1;
    countrySlider.goToCountry(index, userInitiated);
  }, [countrySlider]);

  const handleNavigate = useCallback(() => {
    const validation = validateSearchForm({ location, date });
    if (!validation.isValid) {
      toast.error(t('pleaseSelectLocationAndDate'));
      return;
    }

    groupManagement.saveGroupToSession();
    navigate(
      `/browse?adventure=${adventure}&location=${location}&date=${date}`
    );
  }, [location, date, adventure, navigate, t, groupManagement]);

  const handleSubmitBooking = useCallback(() => {
    const result = eventBooking.submitBooking();
    if (!result.success) {
      toast.error(result.message);
    }
  }, [eventBooking]);

  const [vh, setVh] = useState(900);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef(null);

  const networkQuality = useNetworkQuality();
  const videoSrc = VIDEO_SOURCES[networkQuality] ?? VIDEO_SOURCES.high;

  const videoPreload =
    networkQuality === 'low'
      ? 'none'
      : networkQuality === 'medium'
        ? 'metadata'
        : 'auto';

  useEffect(() => {
    const update = () => setVh(window.innerHeight);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => { });
        } else {
          video.pause();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const { scrollY } = useScroll();

  const searchY = useTransform(scrollY, [0, vh], [vh, 0]);
  const arrowOpacity = useTransform(scrollY, [0, 220], [1, 0]);
  const titleOpacity = useTransform(scrollY, [0, 350], [1, 0]);

  const locationsList = useMemo(() => {
    return adventure
      ? adventures
        ?.find((a) => a.name === adventure)
        ?.location?.map((l) => l.name) || []
      : allLocations?.map((l) => l.name) || [];
  }, [adventure, adventures, allLocations]);

  return (
    <div className="flex flex-col">
      <Nav_Landing />

      <div ref={heroRef} style={{ height: '200vh' }} className="relative">
        <div
          className="sticky top-0 h-screen overflow-hidden"
          style={{ transform: 'translateZ(0)' }}
        >
          <div className="absolute inset-0 bg-black">
            <div className="absolute inset-0 bg-black/45 z-10" />
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload={videoPreload}
              onCanPlay={() => setVideoLoaded(true)}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center center',
                willChange: 'opacity',
                transform: 'translateZ(0)',
                opacity: videoLoaded ? 1 : 0,
                transition: 'opacity 1s ease-out',
              }}
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          </div>

          <motion.div
            className="relative z-20 flex flex-col items-center justify-center h-full px-4 text-center"
            style={{ opacity: titleOpacity }}
          >
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight drop-shadow-lg max-w-4xl"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              {t('discoverAdventures') || 'Discover Your Next Adventure'}
            </motion.h1>
            <motion.p
              className="mt-5 text-base sm:text-lg md:text-xl text-white/75 max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
            >
              {t('adventureDescription') ||
                "Explore the world's most exciting events and experiences."}
            </motion.p>
          </motion.div>

          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2"
            style={{ opacity: arrowOpacity }}
          >
            <span className="text-white/60 text-xs tracking-widest uppercase">
              Scroll
            </span>
            <motion.svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{ y: [0, 6, 0] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </motion.svg>
          </motion.div>

          <motion.div
            className="absolute inset-0 z-30 flex items-center px-4 sm:px-6 md:px-8"
            style={{ y: searchY, willChange: 'transform' }}
          >
            <Suspense
              fallback={
                <div className="w-full h-20 animate-pulse bg-white/20 rounded-xl backdrop-blur-md" />
              }
            >
              <SearchBar
                adventures={adventures}
                adventure={adventure}
                onAdventureChange={setAdventure}
                location={location}
                onLocationChange={setLocation}
                date={date}
                onDateChange={setDate}
                groupMembers={groupManagement.groupMembers}
                onShowGroupDialog={groupManagement.setShowGroupDialog}
                onNavigate={handleNavigate}
                t={t}
                locationsList={locationsList}
                locationsLoading={locationsLoading}
              />
            </Suspense>
          </motion.div>
        </div>
      </div>

      <div className="w-full relative overflow-hidden bg-slate-50 px-4 sm:px-6 md:px-8 py-24 min-h-[80vh] flex flex-col justify-between">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-3xl mix-blend-multiply filter"
            animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute top-[20%] -left-[10%] w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-3xl mix-blend-multiply filter"
            animate={{ x: [0, 50, 0], y: [0, -50, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute -bottom-[10%] right-[20%] w-[400px] h-[400px] bg-indigo-200/40 rounded-full blur-3xl mix-blend-multiply filter"
            animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h2 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 mb-6 tracking-tight">
              {t('featuredEvents')}
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light">
              {t('discoverAmazingAdventures')}
            </p>
          </motion.div>

          {countrySlider.countriesFromEvents.length > 0 && (
            <div className="relative mb-16">
              <motion.div
                className="flex items-center justify-center gap-4 md:gap-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevCountry}
                  className="rounded-full h-12 w-12 hover:bg-white hover:shadow-lg transition-all duration-300 text-gray-800 flex-shrink-0"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                <div className="flex-1 hidden md:flex items-center justify-center overflow-x-auto no-scrollbar mask-gradient-x">
                  <div className="flex items-center justify-center space-x-8 md:space-x-12 px-4 min-w-max mx-auto">
                    {countrySlider.countriesFromEvents.map((country, index) => (
                      <motion.div
                        key={country.name}
                        onClick={() => handleGoToCountry(index, true)}
                        className={`cursor-pointer transition-all duration-500 whitespace-nowrap px-4 py-2 rounded-full ${
                          index === countrySlider.currentCountryIndex
                            ? 'text-3xl md:text-4xl font-bold text-gray-900 scale-100'
                            : 'text-xl md:text-2xl text-gray-400 hover:text-gray-600 scale-95'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        layout
                      >
                        <span
                          className={
                            index === countrySlider.currentCountryIndex
                              ? 'border-b-4 border-gray-900 pb-1'
                              : ''
                          }
                        >
                          {country.name}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 md:hidden relative overflow-hidden h-16 flex items-center justify-center">
                  <AnimatePresence mode="popLayout" custom={sliderDirectionRef.current}>
                    <motion.div
                      key={countrySlider.currentCountryIndex}
                      custom={sliderDirectionRef.current}
                      initial={(dir) => ({ x: dir * 80, opacity: 0 })}
                      animate={{ x: 0, opacity: 1 }}
                      exit={(dir) => ({ x: dir * -80, opacity: 0 })}
                      transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                      className="absolute inset-0 flex items-center justify-center px-2"
                    >
                      <button
                        onClick={() => handleGoToCountry(countrySlider.currentCountryIndex, true)}
                        className="text-3xl font-bold text-gray-900 whitespace-nowrap border-b-4 border-gray-900 pb-1 leading-tight"
                      >
                        {countrySlider.currentCountry?.name}
                      </button>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNextCountry}
                  className="rounded-full h-12 w-12 hover:bg-white hover:shadow-lg transition-all duration-300 text-gray-800 flex-shrink-0"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </motion.div>

              <div className="flex justify-center space-x-3 mt-8">
                {countrySlider.countriesFromEvents.map((_, index) => (
                  <button
                    key={index}
                    aria-label={`Go to country ${index + 1}`}
                    className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                      index === countrySlider.currentCountryIndex
                        ? 'w-12 bg-gray-900'
                        : 'w-1.5 bg-gray-300'
                    }`}
                    onClick={() => handleGoToCountry(index, true)}
                  />
                ))}
              </div>
            </div>
          )}

          {eventsLoading ? (
            <div className="flex justify-center items-center py-12 sm:py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : countrySlider.countriesFromEvents.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={countrySlider.currentCountryIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="relative">
                  <div
                    className="flex overflow-x-auto gap-6 sm:gap-8 pb-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible scroll-smooth"
                    id={`events-container-${countrySlider.currentCountryIndex}`}
                    onScroll={(e) => {
                      const container = e.currentTarget;
                      const scrollLeft = container.scrollLeft;
                      const cardWidth =
                        container.scrollWidth /
                        (countrySlider.currentCountry?.events.length || 1);
                      const currentIndex = Math.round(scrollLeft / cardWidth);
                      const dots = document.querySelectorAll('.event-dot');
                      dots.forEach((dot, idx) => {
                        if (idx === currentIndex) {
                          dot.classList.add('bg-gray-900', 'w-8');
                          dot.classList.remove('bg-gray-300', 'w-2');
                        } else {
                          dot.classList.remove('bg-gray-900', 'w-8');
                          dot.classList.add('bg-gray-300', 'w-2');
                        }
                      });
                    }}
                  >
                    {countrySlider.currentCountry?.events.map(
                      (event, index) => (
                        <motion.div
                          key={event._id}
                          className="min-w-[85vw] sm:min-w-[45vw] md:min-w-0 snap-center md:snap-none h-full"
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Suspense
                            fallback={
                              <div className="h-[400px] w-full animate-pulse bg-gray-200 rounded-xl" />
                            }
                          >
                            <EventCard
                              event={event}
                              onBooking={eventBooking.handleBooking}
                              onViewMore={eventBooking.handleViewMore}
                            />
                          </Suspense>
                        </motion.div>
                      )
                    )}
                  </div>

                  {countrySlider.currentCountry?.events &&
                    countrySlider.currentCountry.events.length > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-8 md:hidden">
                        {countrySlider.currentCountry.events.map((_, index) => (
                          <button
                            key={index}
                            className={`event-dot h-2 rounded-full transition-all duration-300 cursor-pointer ${index === 0
                              ? 'w-8 bg-gray-900'
                              : 'w-2 bg-gray-300'
                              }`}
                            onClick={() => {
                              const container = document.getElementById(
                                `events-container-${countrySlider.currentCountryIndex}`
                              );
                              if (container) {
                                const cardWidth =
                                  container.scrollWidth /
                                  countrySlider.currentCountry.events.length;
                                container.scrollTo({
                                  left: cardWidth * index,
                                  behavior: 'smooth',
                                });
                              }
                            }}
                            aria-label={`Go to event ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="col-span-full text-center py-20">
              <p className="text-gray-400 text-lg">{t('noEventsAvailable')}</p>
            </div>
          )}

          <Dialog
            open={eventBooking.bookingDialog}
            onOpenChange={eventBooking.setBookingDialog}
          >
            <DialogContent className="sm:max-w-[500px] bg-white rounded-2xl max-h-[90vh] flex flex-col p-0">
              <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-0">
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {t('bookYourEvent')}
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  {eventBooking.selectedEvent?.title} in{' '}
                  {eventBooking.selectedEvent?.city},{' '}
                  {eventBooking.selectedEvent?.country}
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 min-h-0 overflow-y-auto dialog-scroll px-4 sm:px-6">
                <div className="space-y-6 py-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={
                          eventBooking.selectedEvent?.image ||
                          '/placeholder.svg'
                        }
                        alt={eventBooking.selectedEvent?.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {eventBooking.selectedEvent?.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {eventBooking.selectedEvent?.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <span>
                          {eventBooking.selectedEvent?.startTime} -{' '}
                          {eventBooking.selectedEvent?.endTime}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>
                          {eventBooking.selectedEvent?.date &&
                            formatDateWithWeekday(
                              eventBooking.selectedEvent.date
                            )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        {t('groupMembers')} (
                        {groupManagement.groupMembers.length + 1})
                      </Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-gray-200 bg-gray-900">
                              <AvatarFallback className="text-white text-xs">
                                {user?.user
                                  ? user.user.email.charAt(0).toUpperCase()
                                  : 'Y'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {user?.user ? user.user.email : 'You'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {t('groupLeader')}
                              </p>
                            </div>
                          </div>
                        </div>
                        {groupManagement.groupMembers.map((member) => (
                          <div
                            key={member._id}
                            className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 border border-gray-200">
                                <AvatarImage
                                  src={
                                    member.profilePicture || '/placeholder.svg'
                                  }
                                  alt={member.name}
                                />
                                <AvatarFallback className="text-xs">
                                  {member.name?.charAt(0) ||
                                    member.email?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-gray-800">
                                  {member.name || 'User'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {member.email}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            groupManagement.setShowGroupDialog(true)
                          }
                          className="w-full mt-2 border-dashed border-gray-300 text-gray-600 hover:text-gray-800 hover:border-gray-400"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          {t('addFriendsToGroup')}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-700"
                      >
                        {t('emailAddress')}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={
                          eventBooking.bookingForm.email ||
                          user?.user?.email ||
                          ''
                        }
                        onChange={(e) =>
                          eventBooking.updateBookingForm({
                            email: e.target.value,
                          })
                        }
                        className="mt-1"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="phone"
                        className="text-sm font-medium text-gray-700"
                      >
                        {t('phoneNumber')}
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={
                          eventBooking.bookingForm.phone ||
                          user?.user?.phone ||
                          ''
                        }
                        onChange={(e) =>
                          eventBooking.updateBookingForm({
                            phone: e.target.value,
                          })
                        }
                        className="mt-1"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0 px-4 sm:px-6 pb-4 sm:pb-6 pt-2 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={eventBooking.closeDialogs}
                  className="px-6 w-full sm:w-auto"
                >
                  {t('cancel')}
                </Button>
                <Button
                  onClick={handleSubmitBooking}
                  className="bg-black hover:bg-gray-800 text-white px-6 w-full sm:w-auto transition-colors"
                  disabled={
                    !eventBooking.bookingForm.email ||
                    !eventBooking.bookingForm.phone
                  }
                >
                  {t('continueToPayment')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={eventBooking.viewMoreDialog}
            onOpenChange={eventBooking.setViewMoreDialog}
          >
            <DialogContent className="sm:max-w-[600px] bg-white rounded-2xl max-h-[90vh] flex flex-col p-0">
              <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-0">
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {eventBooking.selectedEvent?.title}
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  {eventBooking.selectedEvent?.city},{' '}
                  {eventBooking.selectedEvent?.country}
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 min-h-0 overflow-y-auto dialog-scroll px-4 sm:px-6">
                <div className="space-y-6 py-4">
                  <div className="relative h-64 overflow-hidden rounded-xl">
                    <img
                      src={
                        eventBooking.selectedEvent?.image || '/placeholder.svg'
                      }
                      alt={eventBooking.selectedEvent?.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-gray-700">
                        <MapPin className="h-5 w-5" />
                        <span className="font-semibold">
                          {t('locationDetails')}
                        </span>
                      </div>
                      <div className="pl-7 space-y-1">
                        <p className="text-gray-900 font-medium">
                          {eventBooking.selectedEvent?.city},{' '}
                          {eventBooking.selectedEvent?.country}
                        </p>
                        {eventBooking.selectedEvent?.location && (
                          <p className="text-gray-600 text-sm">
                            {eventBooking.selectedEvent.location}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-gray-700">
                        <span className="font-semibold">{t('schedule')}</span>
                      </div>
                      <div className="pl-7 space-y-1">
                        <p className="text-gray-900 font-medium">
                          {eventBooking.selectedEvent?.startTime} -{' '}
                          {eventBooking.selectedEvent?.endTime}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {eventBooking.selectedEvent?.date &&
                            formatDateWithWeekday(
                              eventBooking.selectedEvent.date
                            )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {eventBooking.selectedEvent?.adventures &&
                    eventBooking.selectedEvent.adventures.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-gray-700">
                          <span className="font-semibold">
                            {t('adventuresIncluded')}
                          </span>
                        </div>
                        <div className="pl-7 space-y-2">
                          {eventBooking.selectedEvent.adventures.map(
                            (adventure, index) => (
                              <div
                                key={adventure._id || index}
                                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                              >
                                {adventure.thumbnail && (
                                  <img
                                    src={adventure.thumbnail}
                                    alt={adventure.name}
                                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                  />
                                )}
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900">
                                    {adventure.name}
                                  </h5>
                                  {adventure.description && (
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                      {adventure.description}
                                    </p>
                                  )}
                                  {adventure.exp && (
                                    <div className="flex items-center mt-2">
                                      <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                      <span className="text-xs text-gray-500">
                                        {adventure.exp} XP
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {eventBooking.selectedEvent?.isNftEvent && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-gray-900">
                        <Star className="h-5 w-5 text-gray-900" />
                        <span className="font-semibold">{t('nftReward')}</span>
                      </div>
                      <div className="pl-7">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <Star className="h-4 w-4 text-gray-900" />
                            <span className="font-medium text-gray-900">
                              {t('exclusiveNftAvailable')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {t('completeAllAdventures')}
                          </p>
                          {eventBooking.selectedEvent.nftReward?.nftName && (
                            <div className="mt-3 space-y-1">
                              <p className="text-sm font-medium text-gray-900">
                                {t('nft')}{' '}
                                {eventBooking.selectedEvent.nftReward.nftName}
                              </p>
                              {eventBooking.selectedEvent.nftReward
                                .nftDescription && (
                                  <p className="text-xs text-gray-600">
                                    {
                                      eventBooking.selectedEvent.nftReward
                                        .nftDescription
                                    }
                                  </p>
                                )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-gray-700">
                      <span className="font-semibold">
                        {t('aboutThisEvent')}
                      </span>
                    </div>
                    <div className="pl-7">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {eventBooking.selectedEvent?.description}
                      </p>
                    </div>
                  </div>

                  {(eventBooking.selectedEvent?.price ||
                    eventBooking.selectedEvent?.maxParticipants ||
                    eventBooking.selectedEvent?.difficulty) && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">
                          {t('eventInformation')}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          {eventBooking.selectedEvent?.price && (
                            <div>
                              <span className="text-gray-600">{t('price')}</span>
                              <p className="font-medium text-gray-900">
                                €{eventBooking.selectedEvent.price}
                              </p>
                            </div>
                          )}
                          {eventBooking.selectedEvent?.maxParticipants && (
                            <div>
                              <span className="text-gray-600">
                                {t('maxParticipants')}
                              </span>
                              <p className="font-medium text-gray-900">
                                {eventBooking.selectedEvent.maxParticipants}
                              </p>
                            </div>
                          )}
                          {eventBooking.selectedEvent?.difficulty && (
                            <div>
                              <span className="text-gray-600">
                                {t('difficulty')}
                              </span>
                              <p className="font-medium text-gray-900">
                                {eventBooking.selectedEvent.difficulty}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0 px-4 sm:px-6 pb-4 sm:pb-6 pt-2 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={eventBooking.closeDialogs}
                  className="px-6 w-full sm:w-auto"
                >
                  {t('close')}
                </Button>
                <Button
                  onClick={() => {
                    eventBooking.setViewMoreDialog(false);
                    eventBooking.handleBooking(eventBooking.selectedEvent);
                  }}
                  className="bg-black hover:bg-gray-800 text-white px-6 w-full sm:w-auto transition-colors"
                >
                  <Users className="h-5 w-5 mr-2" />
                  {t('bookNow')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="mt-16">
            <Suspense
              fallback={
                <div className="h-10 w-full animate-pulse bg-gray-200 rounded-lg max-w-sm mx-auto" />
              }
            >
              <PaginationComponent
                currentPage={eventsPage}
                totalPages={eventsTotalPages}
                onPageChange={setEventsPage}
              />
            </Suspense>
          </div>
        </div>
      </div>

      <Dialog
        open={groupManagement.showGroupDialog}
        onOpenChange={groupManagement.setShowGroupDialog}
      >
        <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-800">
              {t('addFriendsToGroup')}
            </DialogTitle>
            <DialogDescription>
              {t('inviteFriendsDescription')}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={groupManagement.handleSearchFriends}
            className="flex flex-col sm:flex-row gap-2 mb-4 mt-4"
          >
            <Input
              type="email"
              placeholder={t('searchByEmail')}
              value={groupManagement.searchEmail}
              onChange={(e) => groupManagement.setSearchEmail(e.target.value)}
              className="flex-1 focus:ring-2 focus:ring-gray-500"
            />
            <Button
              type="submit"
              disabled={
                groupManagement.friendLoading.search ||
                !groupManagement.searchEmail
              }
              className="flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white w-full sm:w-auto"
            >
              {groupManagement.friendLoading.search
                ? t('searching')
                : t('search')}
            </Button>
          </form>
          {groupManagement.searchResult && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                {t('searchResults')}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-gray-100">
                      <AvatarImage
                        src={
                          groupManagement.searchResult.user?.profilePicture ||
                          '/placeholder.svg'
                        }
                        alt={groupManagement.searchResult.user?.name}
                      />
                      <AvatarFallback>
                        {groupManagement.searchResult.user?.name?.charAt(0) ||
                          groupManagement.searchResult.user?.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-800">
                        {groupManagement.searchResult.user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {groupManagement.searchResult.user?.email}
                      </p>
                      {groupManagement.searchResult.isAlreadyFriend && (
                        <p className="text-xs text-green-600">
                          {t('alreadyFriends')}
                        </p>
                      )}
                      {groupManagement.searchResult.hasPendingRequest && (
                        <p className="text-xs text-orange-600">
                          {groupManagement.searchResult.requestStatus
                            ?.isSentByMe
                            ? t('requestSent')
                            : t('requestReceived')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {groupManagement.searchResult.isAlreadyFriend ? (
                      <Button
                        size="sm"
                        onClick={() =>
                          groupManagement.addGroupMember(
                            groupManagement.searchResult.user
                          )
                        }
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                      >
                        <UserPlus size={14} />
                        {t('add')}
                      </Button>
                    ) : groupManagement.searchResult.hasPendingRequest ? (
                      <Button
                        size="sm"
                        disabled
                        className="flex items-center gap-1 bg-gray-400 text-white cursor-not-allowed w-full sm:w-auto"
                      >
                        {groupManagement.searchResult.requestStatus?.isSentByMe
                          ? t('requestSent')
                          : t('requestReceived')}
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          onClick={() =>
                            groupManagement.handleSendFriendRequest(
                              groupManagement.searchResult.user._id
                            )
                          }
                          disabled={groupManagement.friendLoading.action}
                          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs w-full sm:w-auto"
                        >
                          <UserPlus size={14} />
                          {groupManagement.friendLoading.action
                            ? t('sending')
                            : t('sendRequest')}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            groupManagement.addGroupMember(
                              groupManagement.searchResult.user
                            )
                          }
                          className="flex items-center gap-1 bg-black hover:bg-gray-800 text-white w-full sm:w-auto"
                        >
                          <UserPlus size={14} />
                          {t('addDirectly')}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {groupManagement.error.search && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-600 text-sm">
                {groupManagement.error.search}
              </p>
            </div>
          )}

          {groupManagement.showFriendsList &&
            groupManagement.friends.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-800">
                    {t('yourFriends')}
                  </h3>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {groupManagement.friends
                    .filter(
                      (friend) =>
                        !groupManagement.groupMembers.some(
                          (member) => member._id === friend._id
                        )
                    )
                    .map((friend) => (
                      <div
                        key={friend._id}
                        className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 border border-gray-100">
                            <AvatarImage
                              src={friend.profilePicture || '/placeholder.svg'}
                              alt={friend.name}
                            />
                            <AvatarFallback className="text-xs">
                              {friend.name?.charAt(0) ||
                                friend.email?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {friend.name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {friend.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => groupManagement.addGroupMember(friend)}
                          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 w-full sm:w-auto"
                        >
                          <UserPlus size={12} />
                          {t('add')}
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            )}

          {groupManagement.friendLoading.friends && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-center">
              <p className="text-gray-600 text-sm">{t('loadingFriends')}</p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">
                {t('yourGroup')} ({groupManagement.groupMembers.length + 1})
              </h3>
            </div>

            <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm mb-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-gray-100 bg-black">
                  <AvatarFallback className="text-white">
                    {user?.user ? user.user.email.charAt(0).toUpperCase() : 'Y'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-800">
                    {user?.user ? user.user.email : 'You'}
                  </p>
                  <p className="text-xs text-gray-500">{t('groupLeader')}</p>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {groupManagement.groupMembers.map((member) => (
                <motion.div
                  key={member._id}
                  className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-gray-100">
                      <AvatarImage
                        src={member.profilePicture || '/placeholder.svg'}
                        alt={member.name}
                      />
                      <AvatarFallback>
                        {member.name?.charAt(0) || member.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-800">
                        {member.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      groupManagement.removeGroupMember(member._id)
                    }
                    className="flex items-center gap-1 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                  >
                    <UserX size={14} />
                    {t('remove')}
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>

            {groupManagement.groupMembers.length === 0 && (
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-500 text-sm">{t('noFriendsYet')}</p>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button
              onClick={() => groupManagement.setShowGroupDialog(false)}
              className="bg-black hover:bg-gray-800 text-white w-full sm:w-auto"
            >
              {t('done')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer className="!mt-0" />
    </div>
  );
}
