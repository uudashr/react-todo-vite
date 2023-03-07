import { describe, test, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { message } from 'antd';

import { AuthProvider } from '../auth';
import Todo from './Todo';

vi.mock('antd', async () => {
  const originalModule = await vi.importActual('antd');

  return {
    ...originalModule,
    message: {
      ...originalModule.message,
      success: vi.fn(),
    }
  };
});

vi.mock('react-router-dom', async () => {
  const navigate = vi.fn();
  const originalModule = await vi.importActual('react-router-dom')

  return {
    ...originalModule,
    useNavigate: () => navigate,
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('Todo with taskClient', () => {
  const setup = () => {
    const outstandingTasks = [
      { id: 1, name: 'Follow up SRE Support' },
      { id: 2, name: 'Read IAM Service Spec' },
    ];
  
    const completedTasks = [
      { id: 3, name: 'Research chat protocols', completed: true },
    ];

    const authClient = {
      logIn: vi.fn(),
      logOut: vi.fn(),
      token: vi.fn()
    };

    const taskClient = {
      outstandingTasks: vi.fn(() => Promise.resolve(outstandingTasks)),
      completedTasks: vi.fn(() => Promise.resolve(completedTasks)),
      addTask: vi.fn(),
      updateTaskStatus: vi.fn(),
      updateTaskName: vi.fn(),
      deleteTask: vi.fn()
    };

    render(
      <BrowserRouter>
        <AuthProvider authClient={authClient}>
          <Todo taskClient={taskClient} />
        </AuthProvider>
      </BrowserRouter>
    );
    return { authClient, taskClient, outstandingTasks, completedTasks };
  }

  it('renders outstanding tasks', async () => {
    const { taskClient, outstandingTasks } = setup();

    await waitFor(() => {
      expect(taskClient.outstandingTasks).toHaveBeenCalled();
    });

    outstandingTasks.forEach(async (task) => {
      const checkbox = await screen.findByLabelText(task.name);
      expect(checkbox).not.toBeChecked();
    });
  });

  it('renders completed tasks', async () => {
    const { taskClient, completedTasks } = setup();

    await waitFor(() => {
      expect(taskClient.completedTasks).toHaveBeenCalled();
    });

    completedTasks.forEach(async (task) => {
      const checkbox = await screen.findByLabelText(task.name);
      expect(checkbox).toBeChecked();
    });
  });

  test('click/check outstanding task', async () => {
    const { taskClient, outstandingTasks } = setup();

    await waitFor(() => {
      expect(taskClient.outstandingTasks).toHaveBeenCalled();
    });

    const task = outstandingTasks[0];
    const checkbox = await screen.findByLabelText(task.name);
    expect(checkbox).not.toBeChecked();

    taskClient.updateTaskStatus.mockResolvedValue();
    fireEvent.click(checkbox);

    expect(taskClient.updateTaskStatus).toBeCalledWith(task.id, true);
    await waitFor(() => {
      expect(message.success).toBeCalledWith('Task updated');
    });
  });

  test('click/check completed task', async () => {
    const { taskClient, completedTasks } = setup();

    await waitFor(() => {
      expect(taskClient.completedTasks).toHaveBeenCalled();
    });

    const task = completedTasks[0];
    const checkbox = await screen.findByLabelText(task.name);
    expect(checkbox).toBeChecked();
    expect(checkbox.checked).toEqual(true);

    taskClient.updateTaskStatus.mockResolvedValue();
    fireEvent.click(checkbox);

    expect(taskClient.updateTaskStatus).toBeCalledWith(task.id, false);
    await waitFor(() => {
      expect(message.success).toBeCalledWith('Task updated');
    });
  });

  test('add task', async () => {
    const { taskClient } = setup();

    const newTaskName = 'Create spec document';

    await waitFor(() => {
      expect(taskClient.outstandingTasks).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(taskClient.completedTasks).toHaveBeenCalled();
    });

    const taskNameInput = screen.getByPlaceholderText('Enter task name');
    const addTask = screen.getByRole('button', { name: 'Add task' });

    fireEvent.change(taskNameInput, { target: { value: newTaskName } });

    taskClient.addTask.mockResolvedValue();
    fireEvent.click(addTask);

    expect(taskClient.addTask).toBeCalledWith(newTaskName);

    await waitFor(() => {
      expect(taskClient.outstandingTasks).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(taskClient.completedTasks).toHaveBeenCalledTimes(2);
    });
    
    expect(message.success).toHaveBeenCalledWith('Task added');
  });

  test('delete task', async () => {
    const { taskClient, outstandingTasks } = setup();

    await waitFor(() => {
      expect(taskClient.outstandingTasks).toHaveBeenCalled();
    });

    const deleteButtons = await screen.findAllByRole('button', { name: 'Delete' });
    const deleteButton = deleteButtons[0];
    const task = outstandingTasks[0];

    taskClient.deleteTask.mockResolvedValue();
    fireEvent.click(deleteButton);

    expect(taskClient.deleteTask).toBeCalledWith(task.id);
    
    await waitFor(() => {
      expect(taskClient.outstandingTasks).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(taskClient.completedTasks).toHaveBeenCalledTimes(2);
    });

    expect(message.success).toHaveBeenCalledWith('Task deleted');
  });

  test('edit task', async () => {
    const { outstandingTasks, taskClient } = setup();
    const task = outstandingTasks[0];
    const newTextValue = task.name + ' (modified)';

    await waitFor(() => {
      expect(taskClient.outstandingTasks).toBeCalled();
    });

    const listItem = await screen.findByRole('listitem', hasTextContent(task.name));
    const editButton = within(listItem).getByRole('button', { name: 'Edit' });
    fireEvent.click(editButton);

    const textInput = within(listItem).getByDisplayValue(task.name);
    const saveButton = within(listItem).getByRole('button', { name: 'Save' });
    fireEvent.change(textInput, { target: { value: newTextValue } });
    taskClient.updateTaskName.mockResolvedValue();
    fireEvent.click(saveButton);

    expect(taskClient.updateTaskName).toBeCalledWith(task.id, newTextValue);
    
    await waitFor(() => {
      expect(taskClient.outstandingTasks).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(taskClient.completedTasks).toHaveBeenCalledTimes(2);
    });

    expect(message.success).toHaveBeenCalledWith('Task updated');
  });

  test('click sign out', async () => {
    const { authClient, taskClient } = setup();

    const logOutLink = screen.getByRole('button', { name: 'Log out' });
    const navigate = useNavigate();

    await waitFor(() => {
      expect(taskClient.outstandingTasks).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(taskClient.completedTasks).toHaveBeenCalled();
    });

    fireEvent.click(logOutLink);
    expect(authClient.logOut).toBeCalled();
    expect(message.success).toBeCalledWith('Logged out');
    expect(navigate).toBeCalledWith('/login', { replace: true });
  });
});

describe('Todo with no taskClient', () => {
  const setup = () => {
    render(
      <BrowserRouter>
        <Todo />
      </BrowserRouter>
    );
  }

  it('renders no tasks', async () => {
    const checkboxes = screen.queryAllByRole('checkbox');
    expect(checkboxes).toHaveLength(0);
  });

  test('add task', async () => {
    setup();

    const newTaskName = 'Create spec document';

    const taskNameInput = screen.getByPlaceholderText('Enter task name');
    const addTask = screen.getByRole('button', { name: 'Add task' });

    fireEvent.change(taskNameInput, { target: { value: newTaskName } });

    fireEvent.click(addTask);

    expect(message.success).not.toHaveBeenCalledWith('Task added');
  });
});

function hasTextContent(text) {
  return { name: (accessibleName, element) => {
    return element.textContent === text;
  }};
}