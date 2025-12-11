const express = require('express')
const cors = require('cors')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()
app.use(cors())
app.use(express.json())

const dbPath = path.join(__dirname, "Database", "taskManager.db");
console.log("DB Path: ", dbPath);

let db = null

const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        })

        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                email TEXT UNIQUE,
                password TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );  
        `)

        await db.exec(`
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                title TEXT,
                completed INTEGER DEFAULT 0,
                priority TEXT DEFAULT 'LOW',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
        `);

        app.listen(5000, () => {
            console.log("Server running at http://localhost:5000/")
        })
    } catch (e) {
        console.log(`DB Error: ${e.message}`)
        process.exit(1)
    }
}

initializeDBAndServer()

const validateEmailFormat = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

// sign-up api
app.post("/sign-up", async (request, response) => {
    const {username, email, password} = request.body

    // trimming extra white space 
    const trimmedUsername = username.trim()
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    // checking for empty field
    if (!trimmedUsername || !trimmedEmail || !trimmedPassword) {
        response.status(400)
        response.send({error: "All fields are required"})
        return
    }

    // checking for valid password length
    if (trimmedPassword.length < 8) {
        response.status(400)
        response.send({error: "Password must be at least 8 characters long"})
        return 
    }

    // checking for correct email format 
    if (!validateEmailFormat(trimmedEmail)) {
        response.status(400)
        response.send({error: "Invalid email format"})
        return 
    }

    // fetching user by email
    const getUserByEmail = `
        SELECT
            *
        FROM
            users
        WHERE
            email = '${trimmedEmail}';
    `

    // check if email already used or not
    const isEmailALreadyUsed = await db.get(getUserByEmail)

    if (isEmailALreadyUsed) {
        response.status(409)
        response.send({error: "Email already registered"})
        return 
    }

    // fetching user by username
    const getUserByUsername = `
        SELECT
            *
        FROM
            users
        WHERE
            username = '${trimmedUsername}';
    `

    // check if username is already taken or not
    const isUsernameAlreadyTaken = await db.get(getUserByUsername)

    if (isUsernameAlreadyTaken) {
        response.status(409)
        response.send({error: "Username already taken"})
        return 
    }

    // converting password to hashed password
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10)

    // create user query
    const createUserQuery = `
        INSERT INTO users 
            (username, email, password)
        VALUES  (
            '${trimmedUsername}',
            '${trimmedEmail}',
            '${hashedPassword}'
        );
    `

    // creating new user in users table
    await db.run(createUserQuery)

    response.status(200)
    response.send({message: "account created successfully"})
})

// sign-in api
app.post("/sign-in", async (request, response) => {
    const {email, password} = request.body

    // trimming extra white space 
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    // checking for empty field
    if (!trimmedEmail || !trimmedPassword) {
        response.status(400)
        response.send({error: "All fields are required"})
        return
    }

    // checking for correct email format 
    if (!validateEmailFormat(trimmedEmail)) {
        response.status(400)
        response.send({error: "Invalid email format"})
        return
    }

    // get user query
    const getUserQuery = `
        SELECT
            *
        FROM
            users
        WHERE
            email = '${trimmedEmail}';
    `

    // fetching user data from database
    const dbUser = await db.get(getUserQuery)


    if (!dbUser) {
        response.status(400)
        response.send({error: "Invalid email or password"})
        return
    } else {
        // comparing user entered password with password stored in database 
         const isPasswordMatched = await bcrypt.compare(trimmedPassword, dbUser.password)
         if (isPasswordMatched) { // if user enterd password matched with password stored in database 
            // payload for jwt token
            const payload = {
                userId: dbUser.id,
            }
            // creating jwt token 
            const jwt_token = jwt.sign(payload, "MY_SECRET_TOKEN")
            response.send({jwt_token})
         } else { // if password didn't match
            response.status(400)
            response.send({error: "Invalid email or password"})
         }
    }
})

// Authenticate Request
const authenticateToken = (request, response, next) => {
    let jwtToken
    const authHeader = request.headers["authorization"]
    if (authHeader) {
        jwtToken = authHeader.split(" ")[1]
    }
    if (!jwtToken) {
        response.status(401)
        response.send({error: "Invalid Request"})
    } else {
        jwt.verify(jwtToken, "MY_SECRET_TOKEN", async (error, payload) => {
            if (error) {
                response.status(401)
                response.send({error: "Invalid Request"})
            } else {
                const {userId} = payload
                request.userId = userId
                next()
            }
        })
    }
}

// Create Task
app.post("/tasks", authenticateToken, async (request, response) => {
    const {title, priority} = request.body
    const userId = request.userId

    if (!title || !title.trim()) {
        response.status(400)
        response.send({error: "Title is required"})
        return
    }

    const trimmedTitle = title.trim()
    const finalPriority = priority || "LOW"

    const createNewTaskQuery = `
        INSERT INTO tasks
            (user_id, title, priority, completed)
        VALUES
            (?, ?, ?, ?);
    `

    await db.run(createNewTaskQuery, [userId, trimmedTitle, finalPriority, 0])
    response.status(201)
    response.send({message: "Task added successfully"})
})

// GET Tasks
app.get("/tasks", authenticateToken, async (request, response) => {
    const {userId} = request

    const getTasksQuery = `
        SELECT
            *
        FROM
            tasks
        WHERE
            user_id = ?
        ORDER BY
            id DESC;
    `

    const tasksList = await db.all(getTasksQuery, [userId])

    response.status(200)
    response.send({tasksList})
})

// Update Task
app.put("/tasks/:taskId", authenticateToken, async (request, response) => {
    const {taskId} = request.params
    const {userId} = request
    const {title, priority, completed} = request.body

    const getTaskQuery = `
        SELECT
            *
        FROM
            tasks
        WHERE
            user_id = ? and id = ?;
    `

    const task = await db.get(getTaskQuery, [userId, taskId])

    if (!task) {
        response.status(400)
        response.send({erro: "Something went wrong"})
        return
    }

    const updatedTitle = title !== undefined ? title.trim() : task.title
    const updatedPriority = priority !== undefined ? priority : task.priority
    const updatedCompleted = completed !== undefined ? (completed ? 1 : 0) : task.completed

    const updateTaskQuery = `
        UPDATE tasks
        SET title = ?, priority = ?, completed = ?
        WHERE id = ? and user_id = ?;
    `

    await db.run(updateTaskQuery, [updatedTitle, updatedPriority, updatedCompleted, taskId, userId])

    response.send({message: "Task Updated Successfull"})
})

// DELETE Task
app.delete("/tasks/:taskId", authenticateToken, async (request, response) => {
    const {userId} = request
    const {taskId} = request.params

    const getTaskQuery = `
        SELECT
            id
        FROM
            tasks
        WHERE
            id = ?;
    `

    const task = await db.get(getTaskQuery, [taskId])

    if (!task) {
        response.status(404)
        response.send({error: "Task not found"})
        return
    }

    const deleteTaskQuery = `
        DELETE FROM
            tasks
        WHERE
            id = ? AND user_id = ?;
    `
    
    await db.run(deleteTaskQuery, [taskId, userId])

    response.send({message: "Task deleted successfully"})
})