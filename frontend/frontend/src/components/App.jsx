import React, { useState, useEffect } from "react";
import axios from "axios";

export default function App({ token, onLogout }) {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [backendUrl, setBackendUrl] = useState("");
  const [frontUrl, setFrontUrl] = useState('');
  const [backendIp, setBackendIp] = useState('');

  useEffect(() => {
    // Charger backendUrl depuis config
    fetch("/config/config.json")
      .then((res) => res.json())
      .then((config) => {
        setBackendUrl(config.BACKEND_URL);
        setFrontUrl(config.FRONT_IP || '');
      });
    fetch('/api/ping')
      .then((res) => res.json())
      .then((data) => {
        setBackendIp(data.private_ip || '');
      });
  }, []);

  useEffect(() => {
    if (!backendUrl || !token) return;

    // Charger les todos depuis backend
    axios
      .get(`/api/todos`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setTodos(res.data);
      })
      .catch((err) => {
        console.error("Erreur chargement todos", err);
      });
  }, [backendUrl, token]);

  const addTodo = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    axios
      .post(
        `/api/todos`,
        { title: trimmed },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        setTodos([...todos, res.data]);
        setInput("");
      })
      .catch((err) => {
        console.error("Erreur ajout todo", err);
      });
  };

  const removeTodo = (id) => {
    axios
      .delete(`/api/todos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setTodos(todos.filter((t) => t.id !== id));
      })
      .catch((err) => {
        console.error("Erreur suppression todo", err);
      });
  };

  const toggleCompleted = (todo) => {
    axios
      .put(
        `/api/todos/${todo.id}`,
        { completed: !todo.completed },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        setTodos(
          todos.map((t) => (t.id === todo.id ? res.data : t))
        );
      })
      .catch((err) => {
        console.error("Erreur mise à jour todo", err);
      });
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 p-4">
      <header className="w-full max-w-lg flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📝 Ma Todo List</h1>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Déconnexion
        </button>
      </header>

      <div className="w-full max-w-md flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Nouvelle tâche..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-4 py-2 border rounded shadow"
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
        />
        <button
          onClick={addTodo}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Ajouter
        </button>
      </div>

      <ul className="w-full max-w-md space-y-2">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex justify-between items-center bg-white p-3 rounded shadow"
          >
            <div
              onClick={() => toggleCompleted(todo)}
              className={`flex-1 cursor-pointer select-none ${
                todo.completed ? "line-through text-gray-400" : ""
              }`}
              title="Cliquez pour basculer terminé"
            >
              {todo.title}
            </div>
            <button
              onClick={() => removeTodo(todo.id)}
              className="text-red-600 hover:text-red-800 ml-4"
              title="Supprimer la tâche"
            >
              ✖
            </button>
          </li>
        ))}
      </ul>
      {/* Affichage des IP */}
      <div className="mt-6 text-sm text-gray-600 text-center">
        <p>🧭 IP serveur frontend (Node.js) : <span className="font-mono">{frontUrl || '...'}</span></p>
        <p>🔌 IP backend (Flask) : <span className="font-mono">{backendIp || '...'}</span></p>
      </div>
    </div>
  );
}
