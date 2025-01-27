import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl text-center space-y-6 animate-fade-in">
        <h1 className="text-4xl md:text-6xl font-bold text-primary">
          Entwickle nachhaltige Gewohnheiten
        </h1>
        <p className="text-xl text-text-secondary">
          Ein wissenschaftlich fundiertes System, das dir hilft, deine Gewohnheiten
          zu verstehen und zu transformieren.
        </p>
        <div className="space-y-4">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary-light text-white px-8"
            onClick={() => navigate("/onboarding")}
          >
            Starte deine Reise
          </Button>
          <p className="text-sm text-text-secondary">
            Basierend auf wissenschaftlicher Forschung und individueller Anpassung
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;