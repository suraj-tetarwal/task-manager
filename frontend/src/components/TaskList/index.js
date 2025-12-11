import {Component} from 'react'
import Cookies from 'js-cookie'
import {toast} from 'react-toastify'

import TaskCard from "../TaskCard";
import EditTaskModal from '../EditTaskModal';
import "./index.css";

class TaskList extends Component {
    state = {
        tasks: [],
        filter: "ALL",
        isModalOpen: false,
        selectedTask: null,
    }

    openModal = (task) => {
        this.setState({ isModalOpen: true, selectedTask: task });
    };

    closeModal = () => {
        this.setState({ isModalOpen: false, selectedTask: null });
    };

    handleSaveEdit = async (updatedData) => {
        const { selectedTask } = this.state;
        const jwtToken = Cookies.get("jwtToken");

        await fetch(`https://task-manager-1-b6ay.onrender.com/tasks/${selectedTask.id}`, {
            method: "PUT",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
            },
            body: JSON.stringify(updatedData),
        });

        this.closeModal();
        this.fetchTasks();
    };

    componentDidMount() {
        this.fetchTasks()
    }

    fetchTasks = async () => {
        const jwtToken = Cookies.get("jwtToken")

        const url = "https://task-manager-1-b6ay.onrender.com"
        const options = {
            method: "GET",
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
        }

        const response = await fetch(url, options)
        const data = await response.json()
        if (response.ok) {
            const {tasksList} = data
            const formattedTasksList = tasksList.map(eachTask => ({
                id: eachTask.id,
                userId: eachTask.user_id,
                title: eachTask.title,
                priority: eachTask.priority,
                completed: eachTask.completed === 1,
                createdAt: eachTask.created_at, 
            }))
            this.setState({tasks: formattedTasksList})
        } else {
            const {error} = data 
            console.log(error)
        }
    }

    refreshTasks = () => {
        this.fetchTasks();
    };

    onHandleDeleteTask = async (id) => {
        const jwtToken = Cookies.get("jwtToken")

        const toastId = toast.loading("Deleting...")

        const url = `https://task-manager-1-b6ay.onrender.com/${id}`
        const options = {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
        }

        const response = await fetch(url, options)
        const data = await response.json()
        const {message} = data
        toast.update(toastId, {
            render: message,
            type: "success",
            isLoading: false,
            autoClose: 5000
        })

        this.fetchTasks()
    }

    handleToggleCompleted = async (taskId) => {
        const {tasks} = this.state

        const jwtToken = Cookies.get("jwtToken")

        const task = tasks.find(eachTask => eachTask.id === taskId)

        const {completed} = task
        const newStatus = !completed

        const url = `https://task-manager-1-b6ay.onrender.com/${taskId}`
        const options = {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwtToken}`,
            },
            body: JSON.stringify({completed: newStatus}),
        }

        const response = await fetch(url, options)
        const data = await response.json()
        console.log(data)
        this.fetchTasks()
    }

    setFilter = (filterValue) => {
        this.setState({ filter: filterValue });
    };


    render() {
        const {tasks, isModalOpen, selectedTask, filter} = this.state

        let filteredTasks = tasks;

        if (filter === "PENDING") {
            filteredTasks = tasks.filter((t) => !t.completed);
        } else if (filter === "COMPLETED") {
            filteredTasks = tasks.filter((t) => t.completed);
        }

        return (
            <div className="task-list-container">

                <div className="filter-bar">
                    <button
                        className={filter === "ALL" ? "filter-btn active" : "filter-btn"}
                        onClick={() => this.setFilter("ALL")}
                    >
                        All
                    </button>

                    <button
                        className={filter === "PENDING" ? "filter-btn active" : "filter-btn"}
                        onClick={() => this.setFilter("PENDING")}
                    >
                        Pending
                    </button>

                    <button
                        className={filter === "COMPLETED" ? "filter-btn active" : "filter-btn"}
                        onClick={() => this.setFilter("COMPLETED")}
                    >
                        Completed
                    </button>
                </div>


                {tasks.length === 0 ? (
                <p className="no-tasks">No tasks found</p>
                ) : (
                filteredTasks.map((task) => (
                    <TaskCard 
                        key={task.id} 
                        task={task} 
                        onHandleDeleteTask={this.onHandleDeleteTask}
                        handleToggleCompleted={this.handleToggleCompleted}
                        onEdit={() => this.openModal(task)}
                    />
                ))
                )}
                {
                    isModalOpen && (
                        <EditTaskModal
                        task={selectedTask}
                        onClose={this.closeModal}
                        onSave={this.handleSaveEdit}
                        />
                    )
                }
            </div>
        );
  }
}

export default TaskList;
