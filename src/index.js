const express = require("express");
const cors = require("cors");

const { v4: uuid } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const usernameExists = users.find((account) => account.username === username);

  if (!usernameExists) {
    return response.status(400).json({ error: "User not found!" });
  }

  request.account = usernameExists;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(
    (account) => account.username === username
  );

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists." });
  }

  const user = {
    id: uuid(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).send(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { account } = request;

  return response.json(account.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { account } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  account.todos.push(todo);

  return response.status(201).send(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { account } = request;

  const todo = account.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  todo.title = title;
  todo.deadline = deadline;

  return response.status(200).json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { account } = request;
  const { id } = request.params;

  const todo = account.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  todo.done = true;

  return response.status(200).json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { account } = request;
  const { id } = request.params;

  const idExists = account.todos.find((todo) => todo.id === id);

  if (!idExists) {
    return response.status(404).json({ error: "Todo not exists!" });
  }

  const todoList = account.todos;

  const filteredList = todoList.filter((todo) => todo.id !== id);

  account.todos = filteredList;

  return response.status(204).json();
});

module.exports = app;
