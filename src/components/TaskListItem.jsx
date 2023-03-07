import React from 'react';
import PropTypes from 'prop-types';

import { Checkbox, Input, List, Spin, Space, Button } from "antd";
import { LoadingOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

import './TaskListItem.css';

export class Group {
  constructor() {
    this.callbacks = [];
  }

  register(callback) {
    this.callbacks = [...this.callbacks, callback];
  }

  unregister(callback) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  notify(callback) {
    this.callbacks.filter(cb => cb !== callback).forEach(cb => cb());
  }
}

function TaskEditForm(props) {
  const { 
    value = '', 
    onSave = (value, callback) => { callback() }, 
    onCancel = () => {}
  } = props;

  const [taskName, setTaskName] = React.useState(value);
  const [saving, setSaving] = React.useState(false);

  const handleTaskNameChange = (event) => {
    setTaskName(event.target.value);
  };

  const handleSave = () => {
    if (!taskName) {
      return;
    }

    setSaving(true);
    onSave(taskName, (err) => {
      if (err) {
        setSaving(false);
      }
    });
  };

  const handleKeyEnter = () => {
    if (!taskName) {
      return;
    }

    setSaving(true);
    onSave(taskName, (err) => {
      if (err) {
        setSaving(false);
      }
    });
  };

  const handleKeyEscape = () => {
    onCancel();
  };

  const handleKeyPress = (event) => {
    if (event.key !== 'Enter') {
      return;
    }

    handleKeyEnter();
  };

  const handleKeyDown = (event) => {
    if (event.key !== 'Escape') {
      return;
    }

    handleKeyEscape();
  };

  return (
    <Space direction='vertical' style={{ width: '100%' }}>
        <Input 
          value={taskName} 
          onChange={handleTaskNameChange} 
          onKeyPress={handleKeyPress}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <Space>
          <Button
            type='primary'
            size='small'
            onClick={handleSave}
            loading={saving}
          >
            Save
          </Button>

          <Button 
            size='small' 
            onClick={onCancel}
          >
            Cancel
          </Button>
        </Space>
      </Space>
  );
}

TaskEditForm.propTypes = {
  value: PropTypes.string,
  onSave: PropTypes.func,
  onCancel: PropTypes.func
};

function TaskView(props) {
  const { 
    name = '', 
    completed = false, 
    onStatusChange = (completed, callback) => callback(), 
    onDelete = (callback) => callback(),
    onEdit = () => {}
  } = props;

  const mounted = React.useRef(false);
  
  const [deleting, setDeleting] = React.useState(false);
  const [changingStatus, setChangingStatus] = React.useState(false);

  const handleStatusChange = (completed) => {
    setChangingStatus(true);
    onStatusChange(completed, (err) => {
      mounted.current && setChangingStatus(false);
    });
  };

  const handleDelete = () => {
    setDeleting(true);
    onDelete((err) => {
      mounted.current && setDeleting(false)
    });
  };

  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    }
  }, []);

  return (
    <>
      <Checkbox
        style={{ width: '100%' }}
        disabled={changingStatus || deleting}
        checked={completed}
        onChange={event => handleStatusChange(event.target.checked)}
      >
        {name}
      </Checkbox>
      <Space>
        <Spin 
          spinning={changingStatus} 
          size='small' 
          indicator={<LoadingOutlined />} 
        />
        <Button 
          aria-label='Edit'
          icon={<EditOutlined />} 
          size='small' 
          className='hover-control' 
          disabled={changingStatus || deleting}
          onClick={onEdit}
        />
        <Button 
          aria-label='Delete'
          icon={<DeleteOutlined />} 
          size='small' 
          danger 
          className='hover-control' 
          disabled={changingStatus}
          loading={deleting}
          onClick={handleDelete} 
        />
      </Space>
    </>
  );
}

TaskView.propTypes = {
  name: PropTypes.string,
  completed: PropTypes.bool,
  onStatusChange: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func
};

export default function TaskListItem(props) {
  const { 
    task, 
    onStatusChange = (task, callback) => callback(), 
    onNameChange = (task, callback) => callback(), 
    onDelete = (id, callback) => callback(),
    group
  } = props;

  const [editMode, setEditMode] = React.useState(false);

  const handleStatusChange = (completed, done) => {
    group?.notify(groupCallback);

    if (!task) {
      return;
    }

    onStatusChange({id: task.id, completed}, done);
  };

  const handleEdit = () => {
    group?.notify(groupCallback);
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
  };

  const handleNameChange = (name) => {
    onNameChange({id: task.id, name}, (err) => {
      if (err) {
        return;
      }

      setEditMode(false);
    });
  };

  const handleDelete = (done) => {
    group?.notify(groupCallback);

    if (!task) {
      return;
    }

    onDelete(task.id, done);
  };

  const groupCallback = React.useCallback(
    () => {
      setEditMode(false);
    },
    []
  );

  React.useEffect(() => {
    group?.register(groupCallback);
    return () => {
      group?.unregister(groupCallback);
    };
  }, [groupCallback, group]);

  return (
    <List.Item className='hoverable'>
      {editMode ?
        <TaskEditForm 
          value={task?.name}
          onSave={handleNameChange}
          onCancel={handleCancelEdit}
        />  
        :
        <TaskView 
          name={task?.name} 
          completed={task?.completed} 
          onStatusChange={handleStatusChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      }
    </List.Item>
  );
}

TaskListItem.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    completed: PropTypes.bool
  }), 
  onStatusChange: PropTypes.func,
  onNameChange: PropTypes.func,
  onDelete: PropTypes.func,
  group: PropTypes.instanceOf(Group)
};
