import { MdDelete, MdEdit  } from "react-icons/md"

import './index.css'

const TaskCard = props => {
    const {task, onHandleDeleteTask, handleToggleCompleted, onEdit} = props
    const {title, priority, completed, id} = task 

    const onDelete = () => {
        onHandleDeleteTask(id)
    }

    const onChangeCheckbox = () => {
        handleToggleCompleted(id)
    }

    return (
        <div className="task-card">
            <div className="task-left">
                <input
                    type="checkbox"
                    className="task-checkbox"
                    checked={completed}
                    onChange={onChangeCheckbox}
                />
                <div className="task-text">
                    <h4 className={`task-title ${completed ? "task-done" : ""}`}>
                    {title}
                    </h4>

                    <div className="task-meta">
                    <span className={`priority-badge ${priority.toLowerCase()}`}>
                        {priority}
                    </span>

                    <span className={`status-badge ${completed ? "done" : "pending"}`}>
                        {completed ? "Completed" : "Pending"}
                    </span>
                    </div>
                </div>
            </div>

            <div className="task-actions">
                <button className="action-btn edit-btn" onClick={onEdit}>
                    <MdEdit />
                </button>

                <button className="action-btn delete-btn" onClick={onDelete}>
                    <MdDelete />
                </button>
            </div>
        </div>
    );
}

export default TaskCard