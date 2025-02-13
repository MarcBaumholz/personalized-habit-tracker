
import { Card } from "@/components/ui/card";
import { EditDialog } from "@/components/profile/EditDialog";
import { AddZRMResourceDialog } from "@/components/zrm/AddZRMResourceDialog";
import { AddAttitudeGoalDialog } from "@/components/zrm/AddAttitudeGoalDialog";

interface ZRMResource {
  id: string;
  resource_type: string;
  resource_content: string;
  somatic_marker_strength: number;
}

interface AttitudeGoal {
  id: string;
  goal_statement: string;
  if_then_plan?: string;
  embodiment_practice?: string;
}

interface ZRMSectionProps {
  resources: ZRMResource[];
  goals: AttitudeGoal[];
}

export const ZRMSection = ({ resources, goals }: ZRMSectionProps) => {
  return (
    <Card className="p-6 bg-white rounded-2xl shadow-lg border border-blue-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-800">Zürcher Ressourcen Model (ZRM)</h2>
        <div className="flex gap-2">
          <EditDialog title="ZRM Ressourcen bearbeiten">
            <AddZRMResourceDialog />
          </EditDialog>
          <EditDialog title="Haltungsziele bearbeiten">
            <AddAttitudeGoalDialog />
          </EditDialog>
        </div>
      </div>
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium text-blue-700">Ressourcenpool</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {resources?.map((resource) => (
              <div key={resource.id} className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium">{resource.resource_type}</p>
                <p className="text-sm text-blue-600">{resource.resource_content}</p>
                <p className="text-xs text-blue-500 mt-1">
                  Emotionale Stärke: {resource.somatic_marker_strength}/5
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-blue-700">Haltungsziele</h3>
          <div className="space-y-3">
            {goals?.map((goal) => (
              <div key={goal.id} className="p-4 bg-blue-50 rounded-lg">
                <p className="font-medium">{goal.goal_statement}</p>
                {goal.if_then_plan && (
                  <p className="text-sm text-blue-600 mt-2">
                    Wenn-Dann-Plan: {goal.if_then_plan}
                  </p>
                )}
                {goal.embodiment_practice && (
                  <p className="text-sm text-blue-600 mt-1">
                    Embodiment: {goal.embodiment_practice}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
