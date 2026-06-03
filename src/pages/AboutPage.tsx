import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Leaf,
  Truck,
  Shield,
  Heart,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">À propos de Broccagri</h1>
            <p className="text-xs text-muted-foreground">Notre histoire, notre mission</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        {/* Hero */}
        <Card className="p-6 sm:p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Du terroir marocain à votre table
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Broccagri sélectionne et distribue chaque jour des fruits et légumes
            cultivés dans les meilleures régions du Maroc. Notre mission est
            simple : garantir une fraîcheur irréprochable, un juste prix au
            producteur comme au consommateur, et une livraison rapide partout
            au Royaume.
          </p>
        </Card>

        {/* Nos engagements */}
        <div>
          <h3 className="font-bold text-lg mb-3">Nos engagements</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Leaf className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">100 % terroir marocain</h4>
                  <p className="text-sm text-muted-foreground">
                    Produits récoltés à maturité dans les meilleures régions
                    agricoles du pays.
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Livraison rapide</h4>
                  <p className="text-sm text-muted-foreground">
                    Livré sous 24 à 48 h dans tout le Maroc, conservation de
                    la chaîne du frais respectée.
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Qualité garantie</h4>
                  <p className="text-sm text-muted-foreground">
                    Si un produit ne vous satisfait pas, contactez-nous : nous
                    le remplaçons ou vous remboursons.
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Producteurs partenaires</h4>
                  <p className="text-sm text-muted-foreground">
                    Nous travaillons directement avec les agriculteurs, sans
                    intermédiaire, pour un prix juste à la source.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Pour les pros */}
        <Card className="p-5 sm:p-6 border-l-4 border-l-primary">
          <h3 className="font-bold text-lg mb-2">Vous êtes un professionnel ?</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Restaurants, hôtels, marques alimentaires, distributeurs… Broccagri
            propose des prix dégressifs, des livraisons régulières, des
            volumes importants et un contact dédié. Écrivez-nous pour un devis
            personnalisé.
          </p>
          <a href="mailto:contact@broccagri.ma?subject=Demande%20de%20partenariat%20professionnel">
            <Button>Demander un devis pro</Button>
          </a>
        </Card>

        {/* Contact */}
        <Card className="p-5 sm:p-6">
          <h3 className="font-bold text-lg mb-4">Nous contacter</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-primary flex-shrink-0" />
              <a
                href="tel:+212661792473"
                className="hover:underline"
              >
                +212 661 79 24 73
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-primary flex-shrink-0" />
              <a href="mailto:contact@broccagri.ma" className="hover:underline">
                contact@broccagri.ma
              </a>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <span>Casablanca, Maroc</span>
            </div>
          </div>
        </Card>

        <p className="text-xs text-center text-muted-foreground pt-4">
          <Link to="/cgv" className="hover:underline">
            Conditions générales de vente
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
