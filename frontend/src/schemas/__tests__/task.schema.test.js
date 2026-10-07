import { describe, it, expect } from 'vitest';
import { createTaskSchema, updateTaskSchema } from '../task.schema';

// Pruebas unitarias para validar las reglas del esquema Zod de tareas
describe('Pruebas unitarias: createTaskSchema (Zod)', () => {
  // Test 1: Comportamiento esperado cuando los datos cumplen todas las reglas
  it('debe validar correctamente cuando los datos son validos', () => {
    // Datos de entrada que cumplen todas las reglas del esquema
    const validData = {
      title: 'Estudiar para el certamen',
      description: 'Repasar React Hook Form y esquemas Zod',
    };

    // Ejecuta la validacion sincrona con Zod
    const result = createTaskSchema.safeParse(validData);

    // Comprueba que la validacion sea exitosa y los datos coincidan
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Estudiar para el certamen');
      expect(result.data.description).toBe('Repasar React Hook Form y esquemas Zod');
    }
  });

  // Test 2: Comportamiento con campos opcionales
  it('debe permitir crear una tarea sin descripcion (campo opcional)', () => {
    // La descripcion es opcional, por lo que solo se envia el titulo
    const validDataWithoutDescription = {
      title: 'Comprar cuaderno',
    };

    const result = createTaskSchema.safeParse(validDataWithoutDescription);

    // Comprueba que Zod acepte el objeto sin el campo opcional
    expect(result.success).toBe(true);
  });

  // Test 3: Validacion de campo obligatorio vacio
  it('debe rechazar la tarea si el titulo esta vacio', () => {
    // Cadena vacia para probar la regla .min(1)
    const invalidData = {
      title: '',
    };

    const result = createTaskSchema.safeParse(invalidData);

    // Comprueba que la validacion sea rechazada y retorne el mensaje exacto
    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.issues;
      const titleError = issues.find((issue) => issue.path.includes('title'));
      expect(titleError).toBeDefined();
      expect(titleError.message).toBe('El título es obligatorio');
    }
  });

  // Test 4: Validacion de longitud minima
  it('debe rechazar la tarea si el titulo tiene menos de 3 caracteres', () => {
    // Titulo con 2 caracteres para probar la regla .min(3)
    const invalidData = {
      title: 'AB',
    };

    const result = createTaskSchema.safeParse(invalidData);

    // Comprueba el rechazo por no cumplir el minimo de caracteres
    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.issues;
      const titleError = issues.find((issue) => issue.path.includes('title'));
      expect(titleError).toBeDefined();
      expect(titleError.message).toBe('El título debe tener al menos 3 caracteres');
    }
  });

  // Test 5: Validacion de longitud maxima en titulo
  it('debe rechazar la tarea si el titulo supera los 150 caracteres', () => {
    // .repeat(151) genera una cadena que excede el maximo permitido de 150
    const invalidData = {
      title: 'A'.repeat(151),
    };

    const result = createTaskSchema.safeParse(invalidData);

    // Comprueba el rechazo por superar la longitud maxima
    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.issues;
      const titleError = issues.find((issue) => issue.path.includes('title'));
      expect(titleError).toBeDefined();
      expect(titleError.message).toBe('El título no puede superar los 150 caracteres');
    }
  });

  // Test 6: Validacion de longitud maxima en descripcion
  it('debe rechazar la tarea si la descripcion supera los 500 caracteres', () => {
    // .repeat(501) genera una cadena que excede el maximo permitido de 500
    const invalidData = {
      title: 'Tarea con descripcion muy larga',
      description: 'X'.repeat(501),
    };

    const result = createTaskSchema.safeParse(invalidData);

    // Comprueba el rechazo por superar el limite de la descripcion
    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.issues;
      const descError = issues.find((issue) => issue.path.includes('description'));
      expect(descError).toBeDefined();
      expect(descError.message).toBe('La descripción no puede superar los 500 caracteres');
    }
  });

  // DEMOSTRACION EN CLASE: CASO DISENADO PARA FALLAR
  // Descomenta las lineas de abajo para ver como Vitest reporta un error en consola:
  // it('DEMO CLASE: debe fallar intencionalmente para mostrar un error en Vitest', () => {
  //   const invalidData = {
  //     title: 'AB',
  //   };
  //   const result = createTaskSchema.safeParse(invalidData);
  //   expect(result.success).toBe(true);
  // });
});

describe('Pruebas unitarias: updateTaskSchema (Zod)', () => {
  it('valida título, descripción y estado completado correctos', () => {
    const result = updateTaskSchema.safeParse({
      title: 'Preparar presentación',
      description: 'Revisar el material',
      completed: true,
    });

    expect(result.success).toBe(true);
  });

  it('acepta omitir la descripción y el estado completado', () => {
    const result = updateTaskSchema.safeParse({ title: 'Comprar cuaderno' });

    expect(result.success).toBe(true);
  });

  it('rechaza títulos de menos de 3 caracteres con el mensaje esperado', () => {
    const result = updateTaskSchema.safeParse({ title: 'AB' });

    expect(result.success).toBe(false);
    if (!result.success) {
      const titleError = result.error.issues.find((issue) => issue.path.includes('title'));
      expect(titleError?.message).toBe('El título debe tener al menos 3 caracteres');
    }
  });

  it('rechaza títulos de más de 150 caracteres con el mensaje esperado', () => {
    const result = updateTaskSchema.safeParse({ title: 'A'.repeat(151) });

    expect(result.success).toBe(false);
    if (!result.success) {
      const titleError = result.error.issues.find((issue) => issue.path.includes('title'));
      expect(titleError?.message).toBe('El título no puede superar los 150 caracteres');
    }
  });
});
