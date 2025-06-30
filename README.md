# Yam Classification System

A full-stack web application for classifying local yam varieties from leaf images using Convolutional Neural Networks. This project is a collaboration between the Faculty of Engineering, Rajamangala University of Technology Lanna, and the Plant Genetic Conservation Project (RSPG).

## Features

- **Image Upload & Classification:** Upload leaf images to classify yam varieties using a machine learning model.
- **User Authentication:** Secure login and user management.
- **Report Generation:** Generate and preview PDF reports of classification results.
- **Admin Dashboard:** Manage users and view classification history.
- **Responsive UI:** Modern, mobile-friendly interface built with React and Tailwind CSS.
- **API Services:** Node.js/Express backend for user and data management, Python Flask API for ML inference.
- **Dockerized:** Easy deployment with Docker and Docker Compose.

## Project Structure

```
.
├── client/      # React frontend (Vite, Tailwind CSS)
├── server/      # Node.js/Express backend (REST API, MongoDB)
├── ml_api/      # Python Flask ML API (model inference)
├── docker-compose.dev.yml
├── docker-compose.prod.yml
└── README.md
```

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org/) (for local development)
- [Python 3.8+](https://www.python.org/) (for local ML API development)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or local MongoDB

### Development Setup

1. **Clone the repository:**

   ```sh
   git clone https://github.com/your-org/yam-classification.git
   cd yam-classification
   ```

2. **Configure environment variables:**

   - Copy `.env.example` to `.env` and fill in required values for each service.

3. **Start with Docker Compose:**

   ```sh
   docker-compose -f docker-compose.dev.yml up --build
   ```

4. **Access the app:**
   - Frontend: [http://localhost:8000](http://localhost:8000)
   - Backend API: [http://localhost:5001](http://localhost:5001)
   - ML API: [http://localhost:5000](http://localhost:5000)

### Manual Local Development

- **Frontend:**
  ```sh
  cd client
  npm install
  npm run dev
  ```
- **Backend:**
  ```sh
  cd server
  npm install
  npm run dev
  ```
- **ML API:**
  ```sh
  cd ml_api
  pip install -r requirements.txt
  python main.py
  ```

## Technologies Used

- **Frontend:** React, Vite, Tailwind CSS, React Router, React Query
- **Backend:** Node.js, Express, MongoDB, JWT
- **ML API:** Python, Flask, TensorFlow/PyTorch
- **PDF Generation:** @react-pdf/renderer
- **DevOps:** Docker, Docker Compose

## License

This project is licensed under the MIT License.

### Manual Server Production

**Install Docker Engine on Ubuntu**

- _Set up Docker's apt repository._
  `sh
  sudo apt-get update
  sudo apt-get install ca-certificates curl
  sudo install -m 0755 -d /etc/apt/keyrings
  sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  sudo chmod a+r /etc/apt/keyrings/docker.asc

  echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
   $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
   sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update
  `

- _Install the Docker packages._
  `sh
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
`

- _Docker Verison_
  `sh
sudo docker -v
`

**Clone Repo**

```sh
git clone https://github.com/SorayuthJapanya/localyam-classification-app.git
```

**Pull GIT LFS**

```sh
sudo apt update
sudo apt install git-lfs -y
git lfs install

cd localyam-classification-app
git lfs pull
```

**Rename & Edit ENV File**

```sh
mv .env.example .env.prod
```

**Generate a Random JWT Secret Key**

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Create ENV file at Client folder**

```sh
cd client
nano .env
# VITE_AXIOS_SERVER_URL= proxy location server
# VITE_SERVER_URL= proxy location server
```

**Docker container up at root path**

```sh
sudo docker compose -f docker-compose.prod.yml up -d --build
sudo docker ps
```

---

**Developed by the Faculty of Engineering, Rajamangala University of Technology Lanna and the Plant Genetic Conservation Project (RSPG).**
