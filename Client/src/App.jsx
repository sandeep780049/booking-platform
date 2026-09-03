import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { lazy, Suspense } from "react"
import { Toaster } from "sonner"
import { ResetPass } from "./Pages/ResetPass"
import { Loader } from "./components/Loader"
import { AuthProvider } from "./Pages/AuthProvider"
import { AdminRoute, InstructorRoute } from "./Auth/ProtectedRoute"
import { FeatureRoute } from "./Auth/FeatureRoute"
import { useLanguageInitializer } from "./hooks/useLanguageInitializer"
import ChatWidget from "./components/ChatWidget"

// i18n
import { I18nextProvider } from "react-i18next"
import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import enTranslation from "./Locales/en.json"
import frTranslation from "./Locales/fr.json"
import deTranslation from "./Locales/de.json"
import esTranslation from "./Locales/es.json"
import itTranslation from "./Locales/it.json"
import { updateLanguageHeaders } from "./Api/language.api.js"
import { RBACProvider } from "./contexts/RBACContext"
import { CartProvider } from "./Pages/Cart/CartContext"
import { ComparisonProvider } from "./contexts/ComparisonContext"
import { FavoritesProvider } from "./contexts/FavoritesContext"
import { WebsiteSettingsProvider } from "./contexts/WebsiteSettingsContext"
import { ConnectionSpeedIndicator } from "./components/ConnectionSpeedIndicator"

// Lazy loaded components - All pages for better code splitting
const LoginPage = lazy(() => import("./Pages/LoginPage"))
const LandingPage = lazy(() => import("./Pages/LandingPage"))
const FAQ = lazy(() => import("./Pages/FAQ"))
const BrowsingPage = lazy(() => import("./Pages/Browsing/BrowsingPage"))
const Shop = lazy(() => import("./Pages/Shop/Shop"))
const SearchPage = lazy(() => import("./Pages/Shop/SearchPage"))
const NavResultsPage = lazy(() => import("./Pages/Shop/NavResultsPage"))
const ComparisonPage = lazy(() => import("./Pages/Shop/ComparisonPage"))
const FavoritesPage = lazy(() => import("./Pages/Shop/FavoritesPage"))
const Hotel = lazy(() => import("./Pages/Hotel/Hotel"))
const HotelDetail = lazy(() => import("./Pages/Hotel/HotelDetail"))
const HotelCheckout = lazy(() => import("./Pages/Hotel/HotelCheckout"))
const HotelBookingSuccess = lazy(() => import("./Pages/Hotel/HotelBookingSuccess"))
const HotelsAllPage = lazy(() => import("./Pages/Hotel/HotelsAllPage"))
const LoginOptionsPage = lazy(() => import("./Pages/LoginOptionPage"))
const AuthLayout = lazy(() => import("./Pages/Auth/AuthLayout"))
const Terms = lazy(() => import("./Pages/Terms"))
const PrivacyPolicy = lazy(() => import("./Pages/PrivacyPolicy"))
const PaymentApprove = lazy(() => import("./Pages/Payment/PaymentApprove"))
const PaymentCancel = lazy(() => import("./Pages/Payment/PaymentCancel"))
const Payout = lazy(() => import("./Pages/Payment/Payout"))
const PayPalSuccess = lazy(() => import("./Pages/Payment/PayPalSuccess"))
const PayPalError = lazy(() => import("./Pages/Payment/PayPalError"))
const EventBookingConfirmation = lazy(() => import("./Pages/Payment/EventBookingConfirmation"))
const SecretNftEvents = lazy(() => import("./Pages/SecretNftEvents"))
const Mission = lazy(() => import("./Pages/Mission"))
const Booking = lazy(() => import("./Pages/BookingSteps/Booking"))
const ConfirmationPage = lazy(() => import("./Pages/ConfirmationPage/Confirmation"))
const FacebookCallback = lazy(() => import("./Auth/FacebookCallback"))
const LinkedInCallback = lazy(() => import("./Auth/LinkedinCallBack"))
const EventDetailPage = lazy(() => import("./Pages/EventDetailPage"))

// User Dashboard - Lazy loaded
const UserDashboardPage = lazy(() => import("./Pages/User/UserDashboardPage"))
const UserBookingsPage = lazy(() => import("./Pages/User/UserBookingsPage"))
const UserFriendsPage = lazy(() => import("./Pages/User/UserFriendsPage"))
const UserTicketsPage = lazy(() => import("./Pages/User/UserTicketsPage"))
const UserProfilePage = lazy(() => import("./Pages/User/UserProfilePage"))
const UserSettingsPage = lazy(() => import("./Pages/User/UserSettingsPage"))
const DashboardLayout = lazy(() => import("./Pages/User/DashboardLayout"))

// Instructor - Lazy loaded
const InstructorDashboard = lazy(() => import("./Pages/Instructor/InstructorDashboard"))
const SessionForm = lazy(() => import("./Pages/Instructor/SessionForm"))
const InstructorRegister = lazy(() => import("./Pages/Instructor/InstructorLogin").then(module => ({ default: module.InstructorRegister })))
const InstructorSession = lazy(() => import("./Pages/Instructor/InstructorSession").then(module => ({ default: module.InstructorSession })))
const InstructorProfile = lazy(() => import("./Pages/Instructor/InstructorProfile").then(module => ({ default: module.InstructorProfile })))
const InstructorSettings = lazy(() => import("./Pages/Instructor/InstructorSettings"))
const InstructorTickets = lazy(() => import("./Pages/Instructor/InstructorTickets"))
const InstructorPendingReview = lazy(() => import("./Pages/Instructor/InstructorPendingReview"))
const InstructorLayout = lazy(() => import("./Pages/Instructor/InstructorLayout"))

// Hotel - Lazy loaded
const HotelRegister = lazy(() => import("./Pages/Hotel/HotelRegister").then(module => ({ default: module.HotelRegister })))
const HotelProfile = lazy(() => import("./Pages/Hotel/HotelProfile").then(module => ({ default: module.HotelProfile })))
const HotelPendingReview = lazy(() => import("./Pages/Hotel/HotelPending"))

// Admin - Lazy loaded
const AdminDashboard = lazy(() => import("./Pages/Admin/AdminDashboard"))
const AdminLayout = lazy(() => import("./Pages/Admin/Layout"))
const AdventuresPage = lazy(() => import("./Pages/Admin/SubPages/Adventures"))
const AdventureFormPage = lazy(() => import("./Pages/Admin/SubPages/AdventureForm"))
const Dash_Bookings = lazy(() => import("./Pages/Admin/SubPages/Bookings"))
const Dash_User = lazy(() => import("./Pages/Admin/SubPages/Users"))
const Dash_Store = lazy(() => import("./Pages/Admin/SubPages/Store"))
const Dash_Hotels = lazy(() => import("./Pages/Admin/SubPages/Hotels"))
const Dash_Tickets = lazy(() => import("./Pages/Admin/SubPages/Tickets"))
const Dash_Terms = lazy(() => import("./Pages/Admin/SubPages/Terms"))
const Dash_Declation = lazy(() => import("./Pages/Admin/SubPages/Declaration"))
const LocationsPage = lazy(() => import("./Pages/Admin/SubPages/Location"))
const InstructorsPage = lazy(() => import("./Pages/Admin/SubPages/InstructorsVerification"))
const EventsPage = lazy(() => import("./Pages/Admin/SubPages/Events"))
const WebsiteSettings = lazy(() => import("./Pages/Admin/SubPages/WebsiteSettings"))
const SponsorsPage = lazy(() => import("./Pages/Admin/SubPages/Sponsors"))
const AchievementRulesPage = lazy(() => import("./Pages/Admin/SubPages/AchievementRules"))
const RBACManagement = lazy(() => import("./Pages/Admin/SubPages/RBACManagement"))
const RegistrationLimitsPage = lazy(() => import("./Pages/Admin/SubPages/RegistrationLimits"))
const AdventureInsightsPage = lazy(() => import("./Pages/Admin/SubPages/AdventureInsights"))

// Shop - Lazy loaded
const ItemPage = lazy(() => import("./Pages/Shop/ItemPage").then(module => ({ default: module.ItemPage })))
const Cart = lazy(() => import("./Pages/Shop/Cart").then(module => ({ default: module.Cart })))
const CartSuccess = lazy(() => import("./Pages/Shop/CartSuccess"))

// Chat - Lazy loaded
const ChatLayout = lazy(() => import("./Pages/Chat/ChatLayout").then(module => ({ default: module.ChatLayout })))

// Initialize i18n with stored language
const getInitialLanguage = () => {
  try {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    return savedLanguage || 'en';
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return 'en';
  }
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslation },
    fr: { translation: frTranslation },
    de: { translation: deTranslation },
    es: { translation: esTranslation },
    it: { translation: itTranslation },
  },
  lng: getInitialLanguage(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
})

// Initialize language headers
updateLanguageHeaders(getInitialLanguage())

// Language Initializer Component
const LanguageInitializer = () => {
  useLanguageInitializer();
  return null;
};

const ConditionalChatWidget = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isInstructorRoute = location.pathname.startsWith('/instructor');

  if (isAdminRoute || isInstructorRoute) {
    return null;
  }

  return <ChatWidget />;
};


const App = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <RBACProvider>
          <WebsiteSettingsProvider>
            <CartProvider>
              <ComparisonProvider>
                <FavoritesProvider>
                  <LanguageInitializer />
                  <BrowserRouter>
                    <ConnectionSpeedIndicator />
                    <ConditionalChatWidget />
                    <Suspense fallback={<Loader />}>
                      <Toaster />
                      <Routes>
                        {/* Public routes */}
                        <Route element={<AuthLayout />}>
                          <Route path="/login" element={<LoginPage />} />
                          <Route path="/login-options" element={<LoginOptionsPage />} />
                        </Route>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/auth/signInWithLinkedin" element={<LinkedInCallback />} />
                        <Route path="/auth/signInWithFacebook" element={<FacebookCallback />} />
                        <Route path="/secret-nft-events" element={<SecretNftEvents />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        <Route path="/faq" element={<FAQ />} />
                        <Route path="/mission" element={<Mission />} />
                        <Route path="/browse" element={<BrowsingPage />} />
                        <Route path="/event/:id" element={<EventDetailPage />} />
                        <Route path="/booking" element={<Booking />} />
                        <Route path="/payment/approve" element={<PaymentApprove />} />
                        <Route path="/payment/cancel" element={<PaymentCancel />} />
                        <Route path="/instructor/payout" element={<Payout />} />
                        <Route path="/paypal/success" element={<PayPalSuccess />} />
                        <Route path="/paypal/error" element={<PayPalError />} />
                        <Route path="/event-booking-confirmation" element={<EventBookingConfirmation />} />
                        <Route path="/confirmation" element={<ConfirmationPage />} />
                        <Route path="/chat" element={<ChatLayout />} />


                        <Route path="/shop" element={
                          <FeatureRoute feature="shop">
                            <Shop />
                          </FeatureRoute>
                        } />
                        <Route path="/shop/search" element={
                          <FeatureRoute feature="shop">
                            <SearchPage />
                          </FeatureRoute>
                        } />
                        <Route path="/shop/nav" element={
                          <FeatureRoute feature="shop">
                            <NavResultsPage />
                          </FeatureRoute>
                        } />
                        <Route path="/shop/comparison" element={
                          <FeatureRoute feature="shop">
                            <ComparisonPage />
                          </FeatureRoute>
                        } />
                        <Route path="/favorites" element={
                          <FeatureRoute feature="shop">
                            <FavoritesPage />
                          </FeatureRoute>
                        } />
                        <Route path="/book-hotel" element={
                          <FeatureRoute feature="hotels">
                            <Hotel />
                          </FeatureRoute>
                        } />
                        <Route path="/hotels/all" element={
                          <FeatureRoute feature="hotels">
                            <HotelsAllPage />
                          </FeatureRoute>
                        } />
                        <Route path="/hotel/:id" element={
                          <FeatureRoute feature="hotels">
                            <HotelDetail />
                          </FeatureRoute>
                        } />
                        <Route path="/cart" element={
                          <FeatureRoute feature="shop">
                            <Cart />
                          </FeatureRoute>
                        } />
                        <Route path="/cart/success" element={
                          <FeatureRoute feature="shop">
                            <CartSuccess />
                          </FeatureRoute>
                        } />
                        <Route path="/product/:productId" element={
                          <FeatureRoute feature="shop">
                            <ItemPage />
                          </FeatureRoute>
                        } />
                        <Route path="/reset" element={<ResetPass />} />
                        <Route path="/support" element={<Navigate to="/dashboard/tickets" replace />} />
                        <Route path="/instructor/register" element={<InstructorRegister />} />
                        <Route path="/instructor/pending-review" element={<InstructorPendingReview />} />
                        <Route path="/dashboard" element={<DashboardLayout />}>
                          <Route index element={<UserDashboardPage />} />
                          <Route path="bookings" element={<UserBookingsPage />} />
                          <Route path="friends" element={<UserFriendsPage />} />
                          <Route path="tickets" element={<UserTicketsPage />} />
                          <Route path="profile" element={<UserProfilePage />} />
                          <Route path="settings" element={<UserSettingsPage />} />
                        </Route>
                        <Route path="/hotel" element={
                          <FeatureRoute feature="hotels">
                            <HotelProfile />
                          </FeatureRoute>
                        } />
                        <Route path="/hotel/register" element={
                          <FeatureRoute feature="hotels">
                            <HotelRegister />
                          </FeatureRoute>
                        } />                  <Route path="/hotel/pending" element={
                          <FeatureRoute feature="hotels">
                            <HotelPendingReview />
                          </FeatureRoute>
                        } />                  <Route path="/hotel/checkout" element={
                          <FeatureRoute feature="hotels">
                            <HotelCheckout />
                          </FeatureRoute>
                        } />
                        <Route path="/hotel/booking-success" element={
                          <FeatureRoute feature="hotels">
                            <HotelBookingSuccess />
                          </FeatureRoute>
                        } />
                        <Route
                          path="/instructor/"
                          element={
                            <InstructorRoute>
                              <InstructorLayout />
                            </InstructorRoute>
                          }
                        />
                        <Route
                          path="/instructor/dashboard"
                          element={
                            <InstructorRoute>
                              <InstructorDashboard />
                            </InstructorRoute>
                          }
                        />
                        <Route
                          path="/instructor/sessions"
                          element={
                            <InstructorRoute>
                              <InstructorSession />
                            </InstructorRoute>
                          }
                        />
                        <Route
                          path="/instructor/sessions/new"
                          element={
                            <InstructorRoute>
                              <SessionForm />
                            </InstructorRoute>
                          }
                        />
                        <Route
                          path="/instructor/profile"
                          element={
                            <InstructorRoute>
                              <InstructorProfile />
                            </InstructorRoute>
                          }
                        />
                        <Route
                          path="/instructor/support"
                          element={
                            <InstructorRoute>
                              <InstructorTickets />
                            </InstructorRoute>
                          }
                        />
                        <Route
                          path="/instructor/settings"
                          element={
                            <InstructorRoute>
                              <InstructorSettings />
                            </InstructorRoute>
                          }
                        />

                        <Route
                          path="/admin"
                          element={
                            <AdminRoute>
                              <AdminLayout />
                            </AdminRoute>
                          }
                        >
                          <Route
                            index
                            element={
                              <AdminRoute>
                                <AdminDashboard />
                              </AdminRoute>
                            }
                          />
                          <Route path="/admin/adventures" element={<AdventuresPage />} />
                          <Route path="/admin/adventures/new" element={<AdventureFormPage />} />
                          <Route path="/admin/adventures/edit/:id" element={<AdventureFormPage />} />
                          <Route path="/admin/bookings" element={<Dash_Bookings />} />
                          <Route path="/admin/users" element={<Dash_User />} />
                          <Route path="/admin/instructors" element={<InstructorsPage />} />
                          <Route path="/admin/store" element={<Dash_Store />} />
                          <Route path="/admin/hotels" element={<Dash_Hotels />} />
                          <Route path="/admin/tickets" element={<Dash_Tickets />} />
                          <Route path="/admin/terms" element={<Dash_Terms />} />
                          <Route path="/admin/declaration" element={<Dash_Declation />} />
                          <Route path="/admin/locations" element={<LocationsPage />} />
                          <Route path="/admin/registration-limits" element={<RegistrationLimitsPage />} />
                          <Route path="/admin/events" element={<EventsPage />} />
                          <Route path="/admin/website-settings" element={<WebsiteSettings />} />
                          <Route path="/admin/sponsors" element={<SponsorsPage />} />
                          <Route path="/admin/achievement-rules" element={<AchievementRulesPage />} />
                          <Route path="/admin/rbac" element={<RBACManagement />} />
                          <Route path="/admin/adventure-insights" element={<AdventureInsightsPage />} />
                        </Route>
                      </Routes>
                    </Suspense>
                  </BrowserRouter>
                </FavoritesProvider>
              </ComparisonProvider>
            </CartProvider>
          </WebsiteSettingsProvider>
        </RBACProvider>
      </AuthProvider>
    </I18nextProvider>
  )
}

export default App
