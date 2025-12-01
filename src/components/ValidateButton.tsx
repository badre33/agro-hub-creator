import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ValidateButtonProps {
  cartCount: number;
}

export const ValidateButton = ({ cartCount }: ValidateButtonProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleValidate = () => {
    if (cartCount > 0) {
      navigate("/panier");
    } else {
      toast({
        title: "Panier vide",
        description: "Ajoutez des produits à votre panier avant de valider.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t shadow-lg z-40">
      <div className="container mx-auto">
        <Button
          onClick={handleValidate}
          size="lg"
          className="w-full md:w-auto md:min-w-[300px] mx-auto block text-lg py-6 rounded-full shadow-xl"
        >
          Voir le Panier {cartCount > 0 && `(${cartCount})`}
        </Button>
      </div>
    </div>
  );
};
