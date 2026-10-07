import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateTaskSchema } from '../schemas/task.schema';
import tasksService from '../services/tasks.service';

export function EditTaskModal({ task, onTaskUpdated, onClose }) {
  const [apiError, setApiError] = useState(null);

  // Inicialización de React Hook Form conectado con el esquema Zod
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(updateTaskSchema),
    mode: 'onChange',
    defaultValues: {
      title: task.title,
      description: task.description || '',
      completed: task.completed,
    },
  });

  // Actualizar la tarea en el backend tras validar con Zod
  const onSubmit = async (data) => {
    try {
      setApiError(null);
      const updatedTask = await tasksService.update(task.id, data);

      if (onTaskUpdated) {
        onTaskUpdated(updatedTask);
      }

      onClose?.();
    } catch (err) {
      console.error('Error al actualizar tarea:', err);
      setApiError(err.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-100">Editar Tarea</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
            aria-label="Cerrar edición"
          >
            ×
          </button>
        </div>

      {/* Alerta de error si el servidor backend rechaza la petición */}
      {apiError && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-sm">
          {apiError}
        </div>
      )}

      {/* Campo: Título de la tarea */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Título de la tarea <span className="text-indigo-400">*</span>
        </label>
        <input
          type="text"
          placeholder="Ej: Estudiar para el certamen de Software"
          {...register('title')}
          className={`w-full bg-slate-900/90 border rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition ${
            errors.title
              ? 'border-rose-500/80 focus:ring-rose-500/40'
              : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/30'
          }`}
        />
        {/* Mensaje de error de Zod en tiempo real */}
        {errors.title && (
          <p className="text-rose-400 text-xs mt-1.5">
            {errors.title.message}
          </p>
        )}
      </div>

      {/* Campo: Descripción opcional */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Descripción <span className="text-slate-500 text-xs">(opcional)</span>
        </label>
        <textarea
          rows="3"
          placeholder="Detalles adicionales sobre la tarea..."
          {...register('description')}
          className={`w-full bg-slate-900/90 border rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition resize-none ${
            errors.description
              ? 'border-rose-500/80 focus:ring-rose-500/40'
              : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/30'
          }`}
        />
        {/* Mensaje de error de Zod si supera el límite de caracteres */}
        {errors.description && (
          <p className="text-rose-400 text-xs mt-1.5">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Botón de envío */}
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" {...register('completed')} />
          Completada
        </label>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-300 hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm rounded-xl transition cursor-pointer"
          >
            {isSubmitting ? 'Guardando tarea...' : 'Guardar Tarea'}
          </button>
        </div>
      </div>
    </form>
  );
}
