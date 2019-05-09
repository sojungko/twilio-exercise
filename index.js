const express = require('express');
const app = express();
const twilio = require('twilio');
const bodyParser = require('body-parser');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const commands = new Set(['add', 'list', 'remove']);
var todoList = []; // const doesn't make it persist!
function stringifyTodoList(todoList) {
  return todoList.reduce((acc, curr, i) => {
    acc += `${i + 1}. ${curr}\n`;
    return acc;
  }, '')
}

// const client = new twilio(accountSid, authToken);

// client.messages.create({
//   body: `Greetings! The current time is: ${new Date()} 0WS2ISUJLFVZ7U2`,
//   to: '+16467994185',
//   from: '+18088004733',
// })
// .then((message) => console.log(message.sid));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', function (req, res) {
  res.send('Hello World');
})

app.post('/sms', function (req, res) {
  // const response = new MessagingResponse();
  // response.message(`Hi! It looks like your phone number was born in ${req.body.FromCountry}`);
  // res.writeHead(200, { 'Content-Type': 'text/xml' });
  // res.end(response.toString());

  const { body = {} } = req;
  const { Body: receivedMsg } = body;
  const [firstWord, ...rest] = receivedMsg.split(' ');
  const response = new MessagingResponse();

  if (commands.has(firstWord.toLowerCase())) {
    switch (firstWord.toLowerCase()) {
      case 'add': {
        todoList.push(rest.join(' '));
        var toSendMsg = `${rest.join(' ')} added.\n${stringifyTodoList(todoList)}`
        break;
      }  
      case 'list': {
        var toSendMsg = stringifyTodoList(todoList);
        break;
      }
      case 'remove': {
        var toRemoveIndex = Number(rest[0]) - 1;
        const removedItem = todoList.splice(toRemoveIndex, 1);
        var toSendMsg = `${removedItem} removed.\n${stringifyTodoList(todoList)}`;
        break;
      }
    }
    response.message(toSendMsg);
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(response.toString());
  }
})

const server = app.listen(8081, function () {
  const { host, port } = server.address();
  console.log("Example app listening at http://%s:%s", host, port)
})
