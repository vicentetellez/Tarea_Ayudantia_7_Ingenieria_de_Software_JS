import { useState, useEffect } from 'react';
import { TaskCard } from '../components/TaskCard';
import { CreateTaskForm } from '../components/CreateTaskForm';
import tasksService from '../services/tasks.service';
import { useAuth } from '../context/AuthContext';

export function TasksPage() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carga inicial de tareas del usuario autenticado desde el backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const data = await tasksService.getAll();
        setTasks(data);
        setError(null);
      } catch (err) {
        console.error('Error al obtener tareas:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Alternar el estado completado de una tarea
  const handleToggle = async (id) => {
    const taskToToggle = tasks.find((t) => t.id === id);
    if (!taskToToggle) return;

    try {
      const updatedTask = await tasksService.update(id, {
        completed: !taskToToggle.completed,
      });
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === id ? updatedTask : task))
      );
      setError(null);
    } catch (err) {
      console.error('Error al actualizar tarea:', err);
      setError(err.message);
    }
  };

  // Eliminar una tarea del backend y del estado local
  const handleDelete = async (id) => {
    try {
      await tasksService.delete(id);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
      setError(null);
    } catch (err) {
      console.error('Error al eliminar tarea:', err);
      setError(err.message);
    }
  };

  // Agregar la nueva tarea al inicio de la lista
  const handleTaskCreated = (newTask) => {
    setTasks((prevTasks) => [newTask, ...prevTasks]);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        {/* Encabezado con información del usuario y botón de cerrar sesión */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-bold text-indigo-400">Mis Tareas</h1>
            <p className="text-slate-400 text-sm mt-1">
              Bienvenido, <span className="text-slate-200 font-medium">{user?.name}</span>{' '}
              <span className="text-slate-500 text-xs">({user?.email})</span>
            </p>
          </div>
          <button
            onClick={logout}
            className="self-start sm:self-auto px-4 py-2 text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition cursor-pointer"
          >
            Cerrar Sesión
          </button>
        </header>

        {/* Formulario de creación de tareas */}
        <div className="mb-8">
          <CreateTaskForm onTaskCreated={handleTaskCreated} />
        </div>

        {/* Indicador de carga */}
        {loading && (
          <div className="text-center py-10 text-slate-400 animate-pulse">
            <p className="text-lg">Cargando tareas desde la base de datos...</p>
          </div>
        )}

        {/* Mensaje de error del servidor */}
        {!loading && error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-xl mb-6">
            <p className="font-semibold">Aviso de la API:</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Listado de tareas o aviso de lista vacía */}
        {!loading && !error && (
          <div className="space-y-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={() => handleToggle(task.id)}
                onDelete={() => handleDelete(task.id)}
                onTaskUpdated={handleTaskUpdated}
              />
            ))}

            {tasks.length === 0 && (
              <p className="text-center text-slate-500 py-8 border border-dashed border-slate-700 rounded-xl">
                ¡No tienes tareas registradas!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TasksPage;
