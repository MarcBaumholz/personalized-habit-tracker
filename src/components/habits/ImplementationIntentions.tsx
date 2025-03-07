
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ImplementationIntention {
  if: string;
  then: string;
  id: string;
}

interface ImplementationIntentionsProps {
  initialIntentions?: ImplementationIntention[];
  onSave?: (intentions: ImplementationIntention[]) => void;
  title?: string;
  description?: string;
  readOnly?: boolean;
}

export const ImplementationIntentions = ({
  initialIntentions = [],
  onSave,
  title = "Wenn-Dann Pläne",
  description = "Definiere konkrete Situationen und wie du darauf reagieren wirst.",
  readOnly = false,
}: ImplementationIntentionsProps) => {
  const { toast } = useToast();
  const [intentions, setIntentions] = useState<ImplementationIntention[]>(
    initialIntentions.length > 0
      ? initialIntentions
      : [{ if: "", then: "", id: crypto.randomUUID() }]
  );

  const handleAddIntention = () => {
    setIntentions([...intentions, { if: "", then: "", id: crypto.randomUUID() }]);
  };

  const handleRemoveIntention = (id: string) => {
    if (intentions.length === 1) {
      toast({
        title: "Mindestens ein Plan erforderlich",
        description: "Du benötigst mindestens einen Wenn-Dann Plan.",
        variant: "destructive",
      });
      return;
    }
    setIntentions(intentions.filter((intention) => intention.id !== id));
  };

  const handleChange = (id: string, field: "if" | "then", value: string) => {
    setIntentions(
      intentions.map((intention) =>
        intention.id === id ? { ...intention, [field]: value } : intention
      )
    );
  };

  const handleSave = () => {
    // Validate that all intentions have both if and then fields
    const isValid = intentions.every(
      (intention) => intention.if.trim() && intention.then.trim()
    );

    if (!isValid) {
      toast({
        title: "Unvollständige Pläne",
        description: "Bitte fülle alle Wenn-Dann Felder aus.",
        variant: "destructive",
      });
      return;
    }

    onSave?.(intentions);
    toast({
      title: "Pläne gespeichert",
      description: "Deine Wenn-Dann Pläne wurden erfolgreich gespeichert.",
    });
  };

  return (
    <Card className="border shadow-sm bg-white">
      <CardHeader className="bg-blue-50 pb-4 pt-5 px-6">
        <CardTitle className="text-xl text-blue-800">{title}</CardTitle>
        <p className="text-sm text-gray-600">{description}</p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {intentions.map((intention, index) => (
          <div key={intention.id} className="space-y-4 p-4 bg-gray-50 rounded-lg relative">
            {!readOnly && intentions.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 text-gray-500 hover:text-red-500"
                onClick={() => handleRemoveIntention(intention.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <div className="space-y-2">
              <Label htmlFor={`if-${intention.id}`} className="text-blue-700">
                WENN... (Situation/Auslöser)
              </Label>
              {readOnly ? (
                <p className="text-gray-700 p-2 bg-white rounded border border-gray-200">
                  {intention.if || "Keine Angabe"}
                </p>
              ) : (
                <Textarea
                  id={`if-${intention.id}`}
                  placeholder="z.B. Wenn ich morgens aus dem Bett aufstehe..."
                  value={intention.if}
                  onChange={(e) => handleChange(intention.id, "if", e.target.value)}
                  className="resize-none"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`then-${intention.id}`} className="text-green-700">
                DANN... (Konkrete Handlung)
              </Label>
              {readOnly ? (
                <p className="text-gray-700 p-2 bg-white rounded border border-gray-200">
                  {intention.then || "Keine Angabe"}
                </p>
              ) : (
                <Textarea
                  id={`then-${intention.id}`}
                  placeholder="z.B. ...werde ich sofort ein Glas Wasser trinken."
                  value={intention.then}
                  onChange={(e) => handleChange(intention.id, "then", e.target.value)}
                  className="resize-none"
                />
              )}
            </div>
          </div>
        ))}

        {!readOnly && (
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full border-dashed border-gray-300 text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50"
              onClick={handleAddIntention}
            >
              <Plus className="h-4 w-4 mr-2" />
              Weiteren Wenn-Dann Plan hinzufügen
            </Button>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleSave}
            >
              <Save className="h-4 w-4 mr-2" />
              Pläne speichern
            </Button>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
          <h4 className="font-medium text-amber-800 mb-2">Warum Wenn-Dann Pläne wirken:</h4>
          <p className="text-sm text-amber-700">
            Forschungen zeigen, dass konkrete Wenn-Dann Pläne (Implementation Intentions) 
            die Wahrscheinlichkeit der Ausführung einer Gewohnheit signifikant erhöhen. 
            Sie verbinden spezifische Situationen mit automatischen Reaktionen und 
            reduzieren die kognitive Last bei der Entscheidungsfindung.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
