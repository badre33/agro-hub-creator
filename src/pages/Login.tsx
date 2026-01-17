import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Lock, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
          title: "Compte créé! ✅",
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="h-11"
              />
              {isSignUp && (
                <p className="text-xs text-muted-foreground">
                  Minimum 6 caractères
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11"
              disabled={loading}
            >
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
              onClick={() => setIsSignUp(!isSignUp)}
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
