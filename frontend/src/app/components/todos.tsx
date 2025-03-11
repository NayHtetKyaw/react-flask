import { Checkbox, Paper, Text, Group, ActionIcon } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

export interface TodosProps {
  id: string;
  name: string;
  completed: boolean;
  onToggle: (id: string, completed: boolean) => void;
  onDelete?: (id: string) => void;
}

export default function Todos({
  id,
  name,
  completed,
  onToggle,
  onDelete,
}: TodosProps) {
  return (
    <Paper
      p="md"
      withBorder
      w="100%"
      style={{
        opacity: completed ? 0.7 : 1,
        transition: "opacity 0.3s ease",
      }}
    >
      <Group>
        <Group>
          <Checkbox
            checked={completed}
            onChange={(e) => onToggle(id, e.currentTarget.checked)}
            label={
              <Text
                style={{
                  textDecoration: completed ? "line-through" : "none",
                  transition: "text-decoration 0.3s ease",
                }}
                fw={500}
              >
                {name}
              </Text>
            }
            size="md"
          />
        </Group>

        {onDelete && (
          <ActionIcon
            color="red"
            variant="subtle"
            onClick={() => onDelete(id)}
            title="Delete todo"
          >
            <IconTrash size={18} />
          </ActionIcon>
        )}
      </Group>
    </Paper>
  );
}
