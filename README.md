
# AI chat assistant


## Core Technologies:
Node.JS for backend, along with express js for app routing and JWT for user authentication.\
ReactJS and NextJS for frontend along with the tailwind css for design and ReactQuery and Context API for application state management\.
MongoDB database is used to store the data, using the mongoose ORM. \
Large Language Model: Google Gamma 2B https://huggingface.co/google/gemma-2b-it model is locally run by the LM Studio\
Socket.io is used to for message handling as It increased the efficiency of Instant chat application\

## Installation Guide:
The following steps and tools are required to run the application locally.\

## Code:
Please clone the backend and frontend repository from Github\

## Machine Setup:
First Step:  Install node.js on your local machine\
Backend:  cd backend && npm install , then npm run dev to run application\
Frontend:  cd /root/dir and npm install, then npm run dev to run application\
LLM: Install LM Studio and download Google Gamma 2B model, make sure to start the server\
Postman: Install API client postman for APIs and Socket Testing, the postman collection is Attached to the email\n, you import it directly into postman client


## References:
The following are a few references used for building the application.\

https://huggingface.co/google/gemma-2b-it\
https://lmstudio.ai/docs/lmstudio-sdk/quick-start-existing\
https://expressjs.com/en/guide/using-middleware.html\
https://nodejs.org/en/learn/
https://nextjs.org/docs\
https://react.dev/reference/react\
https://mongoosejs.com/docs/models.html\