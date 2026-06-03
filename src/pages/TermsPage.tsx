import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const TermsPage = () => {
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
            <h1 className="text-xl sm:text-2xl font-bold">
              Conditions générales de vente
            </h1>
            <p className="text-xs text-muted-foreground">
              Dernière mise à jour : juin 2026
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="prose prose-sm sm:prose-base max-w-none">
          <p className="text-muted-foreground italic mb-6">
            Ces conditions générales de vente régissent les relations entre
            <strong> Broccagri </strong> et ses clients (particuliers et
            professionnels). En passant commande sur broccagri.ma, vous
            acceptez intégralement les présentes conditions.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-2">1. Objet</h2>
          <p className="text-sm text-muted-foreground">
            Le présent contrat a pour objet la vente de fruits, légumes, herbes
            et salades par Broccagri à toute personne physique ou morale qui
            passe commande via la boutique en ligne broccagri.ma.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-2">2. Produits & disponibilité</h2>
          <p className="text-sm text-muted-foreground">
            Les produits proposés à la vente sont ceux figurant sur le
            catalogue de la boutique au jour de la commande. Compte tenu du
            caractère saisonnier des produits agricoles, certaines références
            peuvent être indisponibles ; Broccagri se réserve le droit de
            modifier ou retirer un produit du catalogue à tout moment.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-2">3. Prix</h2>
          <p className="text-sm text-muted-foreground">
            Les prix sont indiqués en dirhams marocains (DH), toutes taxes
            comprises pour les particuliers et hors taxes pour les
            professionnels (sur demande). Les prix peuvent varier en fonction
            de la saison.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-2">4. Commande & paiement</h2>
          <p className="text-sm text-muted-foreground">
            La commande est validée dès réception du formulaire dûment rempli.
            Le paiement s'effectue par <strong>facturation directe</strong> à
            la livraison (espèces ou virement). Une facture PDF est envoyée
            par email et WhatsApp à la confirmation de commande.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-2">5. Livraison</h2>
          <p className="text-sm text-muted-foreground">
            La livraison est effectuée sous 24 à 48 heures dans tout le Maroc,
            selon la zone géographique. Les frais de livraison, s'il y en a,
            sont précisés avant la validation de commande. En cas de retard
            ou d'absence, le client est contacté par téléphone ou WhatsApp.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-2">6. Annulation</h2>
          <p className="text-sm text-muted-foreground">
            Toute commande peut être annulée par le client tant qu'elle est au
            statut « En attente ». Passé ce statut, l'annulation n'est plus
            possible directement ; contactez-nous au +212 661 79 24 73 ou par
            WhatsApp pour toute demande.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-2">7. Qualité & remboursement</h2>
          <p className="text-sm text-muted-foreground">
            Si un produit ne correspond pas à la qualité attendue, contactez
            notre service client dans les 24 heures suivant la livraison. Le
            produit sera remplacé ou remboursé selon votre préférence.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-2">8. Données personnelles</h2>
          <p className="text-sm text-muted-foreground">
            Les données collectées (nom, téléphone, adresse, email) sont
            utilisées exclusivement pour le traitement de votre commande et
            sa livraison. Elles ne sont jamais cédées à des tiers. Pour exercer
            votre droit d'accès, de rectification ou de suppression, écrivez à
            <a
              href="mailto:contact@broccagri.ma"
              className="text-primary hover:underline ml-1"
            >
              contact@broccagri.ma
            </a>
            .
          </p>

          <h2 className="text-xl font-bold mt-6 mb-2">9. Loi applicable</h2>
          <p className="text-sm text-muted-foreground">
            Les présentes conditions sont régies par le droit marocain. Tout
            litige relèvera de la compétence des tribunaux de Casablanca.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-2">10. Contact</h2>
          <p className="text-sm text-muted-foreground">
            Pour toute question : <br />
            <strong>Broccagri</strong> <br />
            Email :{" "}
            <a
              href="mailto:contact@broccagri.ma"
              className="text-primary hover:underline"
            >
              contact@broccagri.ma
            </a>{" "}
            <br />
            Téléphone / WhatsApp :{" "}
            <a href="tel:+212661792473" className="text-primary hover:underline">
              +212 661 79 24 73
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
