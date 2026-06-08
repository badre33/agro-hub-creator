import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import Cart from "./pages/Cart";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import MyOrders from "./pages/MyOrders";
import MyProfile from "./pages/MyProfile";
import AboutPage from "./pages/AboutPage";
import TermsPage from "./pages/TermsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import NotFound from "./pages/NotFound";
import { WhatsAppFab } from "@/components/WhatsAppFab";

// Affiche le bouton WhatsApp sur les pages publiques mais pas sur admin/login
// (pour éviter le clutter en mode pro).
const FloatingChat = () => {
  const { pathname } = useLocation();
  const hideOn = ["/admin", "/login"];
  if (hideOn.some((p) => pathname.startsWith(p))) return null;
  return <WhatsAppFab />;
};

const queryClient = new QueryClient();

// En prod l'URL dans la barre est broccagri.ma/boutique/* (via proxy depuis le vitrine).
// En dev local on tourne sur /. Le basename de React Router doit refléter ça.
const ROUTER_BASENAME = import.meta.env.PROD ? "/boutique" : "";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={ROUTER_BASENAME}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/panier" element={<Cart />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/mes-commandes" element={<MyOrders />} />
            <Route path="/mon-profil" element={<MyProfile />} />
            <Route path="/a-propos" element={<AboutPage />} />
            <Route path="/cgv" element={<TermsPage />} />
            <Route path="/produit/:slug" element={<ProductDetailPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <FloatingChat />
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
