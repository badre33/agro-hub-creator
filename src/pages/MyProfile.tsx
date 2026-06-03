import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Loader2,
  Save,
  KeyRound,
  Plus,
  Trash2,
  Home,
  MapPin,
  Package,
  Eye,
  EyeOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface SavedAddress {
  id: string;
  label: string; // ex: "Maison", "Bureau"
  address: string;
  city: string;
}

const MyProfile = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Profil
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  // Mot de passe
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  // Adresses sauvegardées (stockées dans user_metadata.addresses)
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [newAddrLabel, setNewAddrLabel] = useState("");
  const [newAddrText, setNewAddrText] = useState("");
  const [newAddrCity, setNewAddrCity] = useState("");
  const [savingAddr, setSavingAddr] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      const {
        data: { user: u },
      } = await supabase.auth.getUser();
      if (!u) {
        navigate("/login");
        return;
      }
      setUser(u);
      const md = u.user_metadata || {};
      setFullName(md.full_name || md.name || "");
      setPhone(md.phone || "");
      setAddresses(Array.isArray(md.addresses) ? md.addresses : []);
      setLoading(false);
    };
    init();
  }, [navigate]);

  const saveProfile = async () => {
    setSavingProfile(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName.trim(), phone: phone.trim() },
    });
    setSavingProfile(false);
    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Profil mis à jour ✓" });
    }
  };

  const changePassword = async () => {
    if (newPassword.length < 6) {
      toast({
        title: "Mot de passe trop court",
        description: "Minimum 6 caractères.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Mots de passe différents",
        description: "Les deux champs doivent être identiques.",
        variant: "destructive",
      });
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Mot de passe modifié ✓",
        description: "Pense à le sauvegarder dans ton gestionnaire de mots de passe.",
      });
      setNewPassword("");
      setConfirmNewPassword("");
    }
  };

  const saveAddresses = async (next: SavedAddress[]) => {
    setSavingAddr(true);
    const { error } = await supabase.auth.updateUser({
      data: { addresses: next },
    });
    setSavingAddr(false);
    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setAddresses(next);
    }
  };

  const addAddress = async () => {
    if (!newAddrLabel.trim() || !newAddrText.trim() || !newAddrCity.trim()) {
      toast({
        title: "Champs requis",
        description: "Libellé, adresse et ville sont obligatoires.",
        variant: "destructive",
      });
      return;
    }
    const next: SavedAddress[] = [
      ...addresses,
      {
        id: crypto.randomUUID(),
        label: newAddrLabel.trim(),
        address: newAddrText.trim(),
        city: newAddrCity.trim(),
      },
    ];
    await saveAddresses(next);
    setNewAddrLabel("");
    setNewAddrText("");
    setNewAddrCity("");
    toast({ title: "Adresse ajoutée ✓" });
  };

  const removeAddress = async (id: string) => {
    if (!confirm("Supprimer cette adresse ?")) return;
    await saveAddresses(addresses.filter((a) => a.id !== id));
    toast({ title: "Adresse supprimée" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link to="/mes-commandes">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold">Mon profil</h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Link to="/mes-commandes">
              <Button variant="outline" size="sm">
                <Package className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Mes commandes</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* ===== Informations personnelles ===== */}
        <Card className="p-5">
          <h2 className="font-bold text-lg mb-1">Informations personnelles</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Utilisées pour pré-remplir tes prochaines commandes.
          </p>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email (non modifiable)</Label>
              <Input id="email" value={user?.email || ""} disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input
                id="fullName"
                placeholder="Ton nom"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+212 6XX XX XX XX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <Button onClick={saveProfile} disabled={savingProfile} className="w-full">
              {savingProfile ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Enregistrer les changements
            </Button>
          </div>
        </Card>

        {/* ===== Carnet d'adresses ===== */}
        <Card className="p-5">
          <h2 className="font-bold text-lg mb-1">Carnet d'adresses</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Sauvegarde tes adresses pour les sélectionner rapidement au checkout.
          </p>

          {addresses.length > 0 && (
            <div className="space-y-2 mb-4">
              {addresses.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/40"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="p-2 bg-primary/10 rounded-full flex-shrink-0">
                      <Home className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-sm">{a.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {a.address}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {a.city}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAddress(a.id)}
                    className="text-destructive hover:bg-destructive/10 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-4 space-y-3">
            <p className="text-sm font-medium">Ajouter une adresse</p>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Libellé (ex: Maison)"
                value={newAddrLabel}
                onChange={(e) => setNewAddrLabel(e.target.value)}
              />
              <Input
                placeholder="Ville"
                value={newAddrCity}
                onChange={(e) => setNewAddrCity(e.target.value)}
              />
            </div>
            <Input
              placeholder="Adresse (rue, n°, quartier...)"
              value={newAddrText}
              onChange={(e) => setNewAddrText(e.target.value)}
            />
            <Button
              variant="outline"
              onClick={addAddress}
              disabled={savingAddr}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter cette adresse
            </Button>
          </div>
        </Card>

        {/* ===== Mot de passe ===== */}
        <Card className="p-5">
          <h2 className="font-bold text-lg mb-1">Changer le mot de passe</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Minimum 6 caractères.
          </p>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="newPwd">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="newPwd"
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                  autoComplete="new-password"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 inline-flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confPwd">Confirmer</Label>
              <Input
                id="confPwd"
                type={showPwd ? "text" : "password"}
                placeholder="••••••••"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
              />
            </div>
            <Button
              onClick={changePassword}
              disabled={changingPassword || !newPassword}
              variant="outline"
              className="w-full"
            >
              {changingPassword ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <KeyRound className="h-4 w-4 mr-2" />
              )}
              Modifier le mot de passe
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MyProfile;
