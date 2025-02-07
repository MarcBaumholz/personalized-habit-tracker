
interface EmptyTodoStateProps {
  getMessage: () => string;
}

export const EmptyTodoState = ({ getMessage }: EmptyTodoStateProps) => {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <p className="text-4xl mb-4">✨</p>
      <p className="text-lg font-medium mb-2">{getMessage()}</p>
      <p className="text-sm">Die perfekte Zeit, um deine Ziele für heute zu setzen!</p>
    </div>
  );
};
