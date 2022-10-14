const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) return response.status(400).json({ "error": "User does not exist" });

  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const user = { id: uuidv4(), name, username, todos: [] };
  users.push(user);

  return response.status(201).send(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.send(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).send(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  if (!user.todos.length) return response.status(400).json({"error": "user has no task registered"});

  user.todos.forEach( todo => {
    if (todo.id === id) {
      todo.title = title;
      todo.deadline = deadline
    }
  });

  return response.status(200).json({"message": "successfully updated"});
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  if (!user.todos.length) return response.status(400).json({"error": "user has no task registered"});

  user.todos.forEach( todo => {
    if (todo.id === id) {
      (todo.done) ? todo.done = false : todo.done = true;
    }
  });

  return response.status(200).send();
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  if (!user.todos.length) return response.status(400).json({"error": "user has no task registered"});

  console.log(user.todos);

  user.todos.forEach( (todo, index) => {
    if (todo.id === id) user.todos.splice(index, 1);
  });

  return response.status(200).json({"message": "task deleted successfully"});
});

module.exports = app;