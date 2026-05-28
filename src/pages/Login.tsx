import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  ArrowLeft,
  Lock,
  UserPlus,
  Eye,
  EyeOff,
  Wand2,
  Copy,
  Check,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * Génère un mot de passe robuste de 16 caractères, garanti d'inclure :
 * - au moins 1 minuscule, 1 majuscule, 1 chiffre, 1 caractère spécial
 * - utilise window.crypto pour de l'aléatoire cryptographique
 */
function generateStrongPassword(length = 16): string {
  const lower = "abcdefghijkmnopqrstuvwxyz"; // sans l ambigu
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // sans I et O ambigus
  const digits = "23456789"; // sans 0 et 1 ambigus
  const symbols = "!@#$%&*?-_+=";
  const all = lower + upper + digits + symbols;

  const pick = (set: string) =>
    set[crypto.getRandomValues(new Uint32Array(1))[0] % set.length];

  // 1 caractère de chaque catégorie, puis remplissage aléatoire
  const required = [pick(lower), pick(upper), pick(digits), pick(symbols)];
  const rest = Array.from({ length: length - required.length }, () => pick(all));
  const chars = [...required, ...rest];

  // Mélange Fisher-Yates avec crypto
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [justCopied, setJustCopied] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGeneratePassword = async () => {
    const generated = generateStrongPassword(16);
    setPassword(generated);
    setConfirmPassword(generated);
    setShowPassword(true);

    // Copie automatique dans le presse-papier pour que l'utilisateur puisse
    // le coller dans son gestionnaire de mots de passe (1Password, etc.)
    try {
      await navigator.clipboard.writeText(generated);
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 2500);
      toast({
        title: "Mot de passe généré ✨",
        description:
          "Copié dans le presse-papier. Sauvegarde-le maintenant dans ton gestionnaire de mots de passe.",
      });
    } catch {
      toast({
        title: "Mot de passe généré ✨",
        description:
          "Affiché ci-dessous. Note-le ou copie-le manuellement avant de valider.",
      });
    }
  };

  const handleCopyPassword = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 2000);
    } catch {
      toast({
        title: "Copie impossible",
        description: "Copie le mot de passe manuellement.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Check if already logged in
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          // Defer navigation to avoid deadlock
          setTimeout(() => {
            checkAdminAndNavigate();
          }, 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        checkAdminAndNavigate();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminAndNavigate = async () => {
    const { data: isAdminResult } = await supabase.rpc("is_admin");
    if (isAdminResult) {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Mot de passe trop court",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive",
      });
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      toast({
        title: "Les mots de passe ne correspondent pas",
        description: "Veuillez retaper le même mot de passe dans les deux champs.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

        if (error) throw error;

        toast({
          title: "Compte créé ✅",
          description: "Vous pouvez maintenant vous connecter.",
        });
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (error) throw error;
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      let message = "Une erreur s'est produite.";

      if (error.message.includes("Invalid login credentials")) {
        message = "Email ou mot de passe incorrect.";
      } else if (error.message.includes("User already registered")) {
        message = "Cet email est déjà utilisé.";
      } else if (error.message.includes("Email not confirmed")) {
        message = "Veuillez confirmer votre email.";
      }

      toast({
        title: isSignUp ? "Erreur d'inscription" : "Erreur de connexion",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la boutique
            </Button>
          </Link>
        </div>

        <Card className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex p-3 bg-primary/10 rounded-full mb-4">
              {isSignUp ? (
                <UserPlus className="h-6 w-6 text-primary" />
              ) : (
                <Lock className="h-6 w-6 text-primary" />
              )}
            </div>
            <h1 className="text-2xl font-bold">
              {isSignUp ? "Créer un compte" : "Connexion"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isSignUp ? "Inscription administrateur" : "Accès administrateur"}
            </p>
          </div>

          {/* form name + autocomplete attributes signal "this is a real login form"
              to Chrome/Safari/Firefox password managers so they offer to save and
              suggest strong passwords. */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            name={isSignUp ? "signup" : "login"}
            autoComplete="on"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="h-11"
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                {isSignUp && (
                  <div className="flex items-center gap-1">
                    {password && (
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        disabled={loading}
                        className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors"
                      >
                        {justCopied ? (
                          <>
                            <Check className="h-3 w-3" />
                            Copié
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copier
                          </>
                        )}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      disabled={loading}
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-primary/10 transition-colors font-medium"
                    >
                      <Wand2 className="h-3 w-3" />
                      Générer un mot de passe fort
                    </button>
                  </div>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="h-11 pr-11"
                  // 'new-password' déclenche la suggestion de mot de passe fort
                  // par Chrome/Safari/Firefox sur l'écran d'inscription.
                  // 'current-password' active l'autofill sur l'écran de connexion.
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {isSignUp && (
                <p className="text-xs text-muted-foreground">
                  Minimum 6 caractères. Astuce : laissez votre navigateur en
                  générer un fort, il sera sauvegardé automatiquement.
                </p>
              )}
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirm-password">
                  Confirmer le mot de passe
                </Label>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="h-11"
                  // Deuxième champ "new-password" : c'est la combinaison qui
                  // déclenche le générateur de mot de passe de Chrome/Safari.
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? "Création..." : "Connexion..."}
                </>
              ) : isSignUp ? (
                "Créer le compte"
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp((v) => !v);
                setShowPassword(false);
                setConfirmPassword("");
              }}
              className="text-sm text-primary hover:underline"
              disabled={loading}
            >
              {isSignUp
                ? "Déjà un compte ? Se connecter"
                : "Pas de compte ? S'inscrire"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
