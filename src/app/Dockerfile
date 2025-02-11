# Stage 1: Build the React app
FROM node:16 AS build
WORKDIR /app
COPY ./frontend /app
RUN npm install axios
RUN npm run build

# Stage 2: Set up Python environment for Flask
FROM python:3.9-slim
WORKDIR /app

RUN useradd -m ctf
USER ctf

COPY --from=build /app/build /app/frontend

COPY app.py /app/app.py
COPY programming_jokes.json /app/programming_jokes.json
RUN pip install --no-cache-dir Flask flask-cors pymysql

# Run Flask server
CMD ["python", "/app/app.py"]

