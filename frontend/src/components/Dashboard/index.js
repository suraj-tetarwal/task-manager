import {Component} from 'react'
import React from 'react'
import Cookies from 'js-cookie'

import { CiLogout } from "react-icons/ci";

import AddTaskForm from '../AddTaskForm'
import TaskList from '../TaskList'

import './index.css'

class Dashboard extends Component {
    taskListRef = React.createRef()

    handleTaskAdded = () => {
        if (this.taskListRef.current) {
            this.taskListRef.current.refreshTasks();
        }
    }

    onLogout = () => {
        const {history} = this.props
        Cookies.remove("jwtToken")
        history.replace("/sign-in")
    }

    render() {
        return (
            <div className="dashboard-container">
                <button className="logout-button" onClick={this.onLogout}>
                    <CiLogout className="logout-icon" />
                </button>
                <h1 className="dashboard-heading">Task Manager</h1>
                <AddTaskForm onTaskAdded={this.handleTaskAdded} />
                <TaskList ref={this.taskListRef} />
            </div>
        )    
    }
}

export default Dashboard