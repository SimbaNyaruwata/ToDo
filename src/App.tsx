import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, CheckCircle, Circle, Loader } from 'lucide-react';

// TypeScript interfaces
interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
}

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// Mock API service
class TodoApiService {
  private static mockTodos: Todo[] = [
    {
      id: '1',
      title: 'Complete React Project',
      description: 'Build a comprehensive to-do application with TypeScript',
      completed: false,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Review API Documentation',
      description: 'Go through the REST API documentation for the backend integration',
      completed: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Set up Development Environment',
      description: 'Configure TypeScript, React, and necessary dev tools',
      completed: true,
      createdAt: new Date().toISOString()
    }
  ];

  private static delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  private static shouldSimulateError = () => Math.random() < 0.1; // 10% chance of error

  static async getTodos(): Promise<ApiResponse<Todo[]>> {
    await this.delay(800);
    
    if (this.shouldSimulateError()) {
      throw new Error('Failed to fetch todos. Please try again.');
    }

    return {
      data: [...this.mockTodos],
      message: 'Todos fetched successfully',
      success: true
    };
  }

  static async createTodo(todo: Omit<Todo, 'id' | 'createdAt'>): Promise<ApiResponse<Todo>> {
    await this.delay(600);
    
    if (this.shouldSimulateError()) {
      throw new Error('Failed to create todo. Please try again.');
    }

    const newTodo: Todo = {
      ...todo,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    this.mockTodos.unshift(newTodo);
    
    return {
      data: newTodo,
      message: 'Todo created successfully',
      success: true
    };
  }

  static async updateTodo(id: string, updates: Partial<Todo>): Promise<ApiResponse<Todo>> {
    await this.delay(500);
    
    if (this.shouldSimulateError()) {
      throw new Error('Failed to update todo. Please try again.');
    }

    const todoIndex = this.mockTodos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) {
      throw new Error('Todo not found');
    }

    this.mockTodos[todoIndex] = { ...this.mockTodos[todoIndex], ...updates };
    
    return {
      data: this.mockTodos[todoIndex],
      message: 'Todo updated successfully',
      success: true
    };
  }

  static async deleteTodo(id: string): Promise<ApiResponse<null>> {
    await this.delay(400);
    
    if (this.shouldSimulateError()) {
      throw new Error('Failed to delete todo. Please try again.');
    }

    const todoIndex = this.mockTodos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) {
      throw new Error('Todo not found');
    }

    this.mockTodos.splice(todoIndex, 1);
    
    return {
      data: null,
      message: 'Todo deleted successfully',
      success: true
    };
  }
}

// Loading Spinner Component
const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex justify-center items-center">
      <Loader className={`${sizeClasses[size]} animate-spin text-blue-600`} />
    </div>
  );
};

// Error Message Component
const ErrorMessage: React.FC<{ message: string; onDismiss: () => void }> = ({ message, onDismiss }) => (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex justify-between items-center">
    <span>{message}</span>
    <button
      onClick={onDismiss}
      className="text-red-500 hover:text-red-700 font-bold text-xl"
    >
      ×
    </button>
  </div>
);

// Success Message Component
const SuccessMessage: React.FC<{ message: string; onDismiss: () => void }> = ({ message, onDismiss }) => (
  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex justify-between items-center">
    <span>{message}</span>
    <button
      onClick={onDismiss}
      className="text-green-500 hover:text-green-700 font-bold text-xl"
    >
      ×
    </button>
  </div>
);

// Add Todo Form Component
const AddTodoForm: React.FC<{ onAdd: (todo: Omit<Todo, 'id' | 'createdAt'>) => void; loading: boolean }> = ({ onAdd, loading }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (title.trim() && description.trim()) {
      onAdd({
        title: title.trim(),
        description: description.trim(),
        completed: false
      });
      setTitle('');
      setDescription('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Todo</h2>
      <div className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Todo title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>
        <div>
          <textarea
            placeholder="Todo description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            disabled={loading}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading || !title.trim() || !description.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Todo
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Todo Item Component
const TodoItem: React.FC<{
  todo: Todo;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
  loading: boolean;
}> = ({ todo, onUpdate, onDelete, loading }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description);

  const handleSave = () => {
    if (editTitle.trim() && editDescription.trim()) {
      onUpdate(todo.id, {
        title: editTitle.trim(),
        description: editDescription.trim()
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description);
    setIsEditing(false);
  };

  const handleToggleComplete = () => {
    onUpdate(todo.id, { completed: !todo.completed });
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${todo.completed ? 'opacity-75' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Completion Toggle */}
        <button
          onClick={handleToggleComplete}
          disabled={loading}
          className="mt-1 text-gray-400 hover:text-blue-600 disabled:cursor-not-allowed"
        >
          {todo.completed ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={2}
                disabled={loading}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={loading || !editTitle.trim() || !editDescription.trim()}
                  className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? <LoadingSpinner size="sm" /> : <Save className="w-3 h-3" />}
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 disabled:cursor-not-allowed"
                >
                  <X className="w-3 h-3" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className={`font-semibold text-gray-800 ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                {todo.title}
              </h3>
              <p className={`text-gray-600 mt-1 ${todo.completed ? 'line-through text-gray-400' : ''}`}>
                {todo.description}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Created: {new Date(todo.createdAt).toLocaleDateString()}
              </p>
            </>
          )}
        </div>

        {/* Actions */}
        {!isEditing && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              disabled={loading}
              className="text-gray-400 hover:text-blue-600 disabled:cursor-not-allowed"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(todo.id)}
              disabled={loading}
              className="text-gray-400 hover:text-red-600 disabled:cursor-not-allowed"
            >
              {loading ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Todo List Component
const TodoList: React.FC<{
  todos: Todo[];
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
  loading: boolean;
}> = ({ todos, onUpdate, onDelete, loading }) => {
  if (todos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No todos yet. Create your first one above!</p>
      </div>
    );
  }

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Your Todos</h2>
        <span className="text-sm text-gray-600">
          {completedCount} of {totalCount} completed
        </span>
      </div>
      <div className="space-y-3">
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onUpdate={onUpdate}
            onDelete={onDelete}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
};

// Main App Component
const TodoApp: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch todos on component mount
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setLoading(true);
        const response = await TodoApiService.getTodos();
        setTodos(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch todos');
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, []);

  // Add new todo
  const handleAddTodo = async (newTodo: Omit<Todo, 'id' | 'createdAt'>) => {
    try {
      setOperationLoading(true);
      const response = await TodoApiService.createTodo(newTodo);
      setTodos(prev => [response.data, ...prev]);
      setSuccessMessage(response.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo');
    } finally {
      setOperationLoading(false);
    }
  };

  // Update todo
  const handleUpdateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      setOperationLoading(true);
      const response = await TodoApiService.updateTodo(id, updates);
      setTodos(prev => prev.map(todo => todo.id === id ? response.data : todo));
      setSuccessMessage(response.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo');
    } finally {
      setOperationLoading(false);
    }
  };

  // Delete todo
  const handleDeleteTodo = async (id: string) => {
    try {
      setOperationLoading(true);
      const response = await TodoApiService.deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
      setSuccessMessage(response.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
    } finally {
      setOperationLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Todo Application</h1>
          <p className="text-gray-600">Manage your tasks efficiently with TypeScript & React</p>
        </header>

        {/* Error Message */}
        {error && (
          <ErrorMessage
            message={error}
            onDismiss={() => setError(null)}
          />
        )}

        {/* Success Message */}
        {successMessage && (
          <SuccessMessage
            message={successMessage}
            onDismiss={() => setSuccessMessage(null)}
          />
        )}

        {/* Add Todo Form */}
        <AddTodoForm onAdd={handleAddTodo} loading={operationLoading} />

        {/* Loading State for Initial Fetch */}
        {loading ? (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 mt-4">Loading your todos...</p>
          </div>
        ) : (
          /* Todo List */
          <TodoList
            todos={todos}
            onUpdate={handleUpdateTodo}
            onDelete={handleDeleteTodo}
            loading={operationLoading}
          />
        )}
      </div>
    </div>
  );
};

export default TodoApp;