import {Component} from 'react'
import Cookies from 'js-cookie'
import {toast} from 'react-toastify'
import { FaPlus } from "react-icons/fa6"

import './index.css'

class AddTaskForm extends Component {
    state = {
        title: "",
        priority: "LOW",
    }

    onChangeTitle = (event) => {
        this.setState({title: event.target.value})
    }

    onChangePriority = (event) => {
        this.setState({priority: event.target.value})
    }

    handleAddTask = async event => {
        event.preventDefault()
        const {title, priority} = this.state

        const toastId = toast.loading("Adding new task")

        if (!title.trim()) {
            toast.update(toastId, {
                render: "Nothing text to add",
                type: "warning",
                isLoading: false,
                autoClose: 5000
            })
        } 

        const newTask = {
            title: title.trim(),
            priority
        }

        const jwtToken = Cookies.get("jwtToken")

        const url = "http://localhost:5000/tasks/"
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwtToken}`
            },
            body: JSON.stringify(newTask), 
        }

        const response = await fetch(url, options)
        const data = await response.json()
        if (response.ok) {
            const {message} = data
            toast.update(toastId, {
                render: message,
                type: "success",
                isLoading: false,
                autoClose: 5000
            })
            this.setState({title: "", priority: "LOW"})

            if (this.props.onTaskAdded) {
                this.props.onTaskAdded()
            }

        } else {
            const {error} = data
            toast.update(toastId, {
                render: error,
                type: "error",
                isLoading: false,
                autoClose: 5000
            })
        }
    }

    render() {
        const {title, priority} = this.state
        return (
            <form className="add-task-box" onSubmit={this.handleAddTask}>
                <input 
                    type="text"
                    placeholder="Enter task title..." 
                    className="task-input" 
                    value={title}
                    onChange={this.onChangeTitle} 
                />
                <select className="priority-select" value={priority} onChange={this.onChangePriority}>
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                </select>
                <button type="submit" className="add-btn">
                    <FaPlus className="add-icon" />
                    Add
                </button>
            </form>
        )
    }
}

export default AddTaskForm
