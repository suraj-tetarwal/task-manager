import { Component } from "react";

import "./index.css";

class EditTaskModal extends Component {
    state = {
      title: this.props.task.title,
      priority: this.props.task.priority,
    }

  onChangeTitle = (event) => {
    this.setState({ title: event.target.value });
  };

  onChangePriority = (event) => {
    this.setState({ priority: event.target.value });
  };

  handleSave = () => {
    const { title, priority } = this.state;
    this.props.onSave({ title, priority });
  };

  render() {
    const { onClose } = this.props;
    const { title, priority } = this.state;

    return (
      <div className="modal-overlay">
        <div className="modal-box">

          <h3 className="modal-title">Edit Task</h3>

          <input
            type="text"
            value={title}
            onChange={this.onChangeTitle}
            className="modal-input"
            placeholder="Task title"
          />

          <select
            value={priority}
            onChange={this.onChangePriority}
            className="modal-select"
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>

          <div className="modal-actions">
            <button className="modal-cancel-btn" onClick={onClose}>
              Cancel
            </button>

            <button className="modal-save-btn" onClick={this.handleSave}>
              Save
            </button>
          </div>

        </div>
      </div>
    );
  }
}

export default EditTaskModal;
