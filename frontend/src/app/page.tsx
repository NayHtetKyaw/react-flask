"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Flex,
  Title,
  TextInput,
  Button,
  Group,
  Box,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import Todos from "./components/todos";

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Home() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newTodoText, setNewTodoText] = useState<string>("");

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await axios.get<TodoItem[]>(`${API_URL}/api/todos`);

      const transformedData = response.data.map((item) => ({
        id: item.id.toString(),
        text: item.text,
        completed: item.completed,
      }));

      setTodos(transformedData);
    } catch (error) {
      console.error("Error fetching todos:", error);
      notifications.show({
        title: "Error",
        message: "Failed to load todos. Please try again later.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add new todo
  const addTodo = async () => {
    if (!newTodoText.trim()) return;

    try {
      const response = await axios.post<TodoItem>(`${API_URL}/api/todos`, {
        text: newTodoText,
        completed: false,
      });

      setTodos((prev) => [
        ...prev,
        {
          id: response.data.id.toString(),
          text: response.data.text,
          completed: response.data.completed,
        },
      ]);

      setNewTodoText("");

      notifications.show({
        title: "Success",
        message: "Todo added successfully!",
        color: "green",
      });
    } catch (error) {
      console.error("Error adding todo:", error);
      notifications.show({
        title: "Error",
        message: "Failed to add todo. Please try again.",
        color: "red",
      });
    }
  };

  // Toggle todo completion status
  const handleToggle = async (id: string, completed: boolean) => {
    try {
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id ? { ...todo, completed } : todo,
        ),
      );

      await axios.patch(`${API_URL}/api/todos/${id}`, {
        completed,
      });
    } catch (error) {
      console.error("Error updating todo:", error);

      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id ? { ...todo, completed: !completed } : todo,
        ),
      );

      notifications.show({
        title: "Error",
        message: "Failed to update todo. Changes reverted.",
        color: "red",
      });
    }
  };

  // Delete a todo
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/api/todos/${id}`);
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));

      notifications.show({
        title: "Success",
        message: "Todo deleted successfully!",
        color: "green",
      });
    } catch (error) {
      console.error("Error deleting todo:", error);
      notifications.show({
        title: "Error",
        message: "Failed to delete todo. Please try again.",
        color: "red",
      });
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTodo();
  };

  return (
    <Container size="md" p="md">
      <Title order={1} ta="center" mb="lg">
        Flask TODOs App
      </Title>

      {/* Add Todo Form */}
      <Box component="form" onSubmit={handleSubmit} mb="xl">
        <Group>
          <TextInput
            placeholder="Add a new task..."
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            style={{ flex: 1 }}
            data-autofocus
          />
          <Button type="submit" disabled={!newTodoText.trim()}>
            Add Todo
          </Button>
        </Group>
      </Box>

      {/* Loading State */}
      {loading ? (
        <Title order={3} ta="center" c="dimmed">
          Loading todos...
        </Title>
      ) : todos.length === 0 ? (
        <Title order={3} ta="center" c="dimmed">
          No todos yet. Add one above!
        </Title>
      ) : (
        <Flex wrap="wrap" gap="md" justify="center">
          {todos.map((todo, index) => (
            <Flex key={todo.id} align="center" gap="xs" miw="45%">
              <Title order={4}>{index + 1}.</Title>
              <Todos
                id={todo.id}
                name={todo.text}
                completed={todo.completed}
                onToggle={handleToggle}
                onDelete={() => handleDelete(todo.id)}
              />
            </Flex>
          ))}
        </Flex>
      )}
    </Container>
  );
}
