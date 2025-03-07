
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const PastReflections = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vergangene Reflexionen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Heute</span>
              <span className="text-xs text-gray-500">14:30</span>
            </div>
            <p className="text-sm text-gray-700">Heute ist es mir leichter gefallen als gestern. Ich konnte die Gewohnheit direkt nach dem Aufstehen umsetzen.</p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-md">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Gestern</span>
              <span className="text-xs text-gray-500">19:15</span>
            </div>
            <p className="text-sm text-gray-700">Ich hatte heute Schwierigkeiten, die Gewohnheit in meinen Tagesablauf zu integrieren. Morgen werde ich es direkt nach dem Frühstück versuchen.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
