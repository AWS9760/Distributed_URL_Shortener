# 🔗 Distributed URL Shortener

A scalable, high-performance URL shortening platform built with the **MERN Stack** and **Redis**, designed to handle large volumes of traffic while providing detailed analytics and secure user management.

Transform long URLs into short, shareable links, monitor engagement through real-time analytics, and leverage Redis-powered caching for lightning-fast redirects.

---

## ✨ Features

### 🔗 URL Management

* Shorten long URLs instantly
* Generate custom aliases for branded links
* Unique short code generation using NanoID
* Automatic URL validation
* Link expiration support *(optional enhancement)*

### 🔐 Authentication & Security

* Secure user registration and login
* Password hashing with bcrypt
* JWT-based authentication
* Protected routes and middleware
* User-specific URL management

### 📊 Analytics Dashboard

Track detailed statistics for every shortened URL:

* Total clicks
* Unique visitors
* Browser statistics
* Device statistics
* Click history
* Traffic trends

Interactive charts powered by Chart.js provide clear visual insights.

### ⚡ Performance Optimization

* Redis caching for ultra-fast redirects
* Reduced database load
* Improved scalability under heavy traffic
* Optimized API responses

### 🎨 Modern User Interface

* Responsive design for desktop and mobile
* Clean dashboard experience
* Real-time notifications
* Fast navigation with React Router
* Built with Tailwind CSS

### 🌐 Distributed Architecture

* MongoDB for persistent storage
* Redis for caching layer
* Stateless backend APIs
* Cloud deployment ready
* Horizontal scaling support

---

## 🏗️ System Architecture

```text
┌─────────────┐
│   React UI  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Express API │
└──────┬──────┘
       │
 ┌─────┴─────┐
 ▼           ▼
MongoDB    Redis
(Database) (Cache)
```

---

## 🛠️ Tech Stack

### Frontend

| Technology      | Purpose                       |
| --------------- | ----------------------------- |
| React 18        | User Interface                |
| Vite            | Fast Development & Build Tool |
| Tailwind CSS    | Styling                       |
| React Router v6 | Routing                       |
| Axios           | API Communication             |
| Chart.js        | Analytics Visualization       |
| React Hot Toast | Notifications                 |

### Backend

| Technology   | Purpose                    |
| ------------ | -------------------------- |
| Node.js      | Runtime Environment        |
| Express.js   | Backend Framework          |
| MongoDB      | Primary Database           |
| Mongoose     | ODM                        |
| Redis        | Caching Layer              |
| ioredis      | Redis Client               |
| JWT          | Authentication             |
| bcryptjs     | Password Hashing           |
| NanoID       | Short URL Generation       |
| UA Parser JS | Device & Browser Analytics |

---

## 📁 Project Structure

```bash
distributed-url-shortener/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── services/
│   ├── config/
│   └── package.json
│
└── README.md
```

---

## 📦 Prerequisites

Make sure the following are installed on your system:

* Node.js (v16+)
* MongoDB (Local or Atlas)
* Redis (Local or Cloud)
* Git

---

# 🚀 Installation

## 1. Clone the Repository

```bash
git clone https://github.com/yourusername/distributed-url-shortener.git

cd distributed-url-shortener
```

---

## 2. Backend Setup

Navigate to the backend folder:

```bash
cd backend

npm install
```

Create a `.env` file:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

REDIS_URL=your_redis_connection_string

JWT_SECRET=your_super_secret_key

JWT_EXPIRES_IN=7d

BASE_URL=http://localhost:5000

FRONTEND_URL=http://localhost:5173

NODE_ENV=development
```

Start the backend server:

```bash
npm run dev
```

Backend will run at:

```text
http://localhost:5000
```

---

## 3. Frontend Setup

Open another terminal:

```bash
cd frontend

npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend server:

```bash
npm run dev
```

Frontend will run at:

```text
http://localhost:5173
```

---

## 🔄 URL Redirection Flow

```text
User Clicks Short URL
          │
          ▼
     Express Server
          │
          ▼
     Check Redis Cache
      │          │
      │ HIT      │ MISS
      ▼          ▼
 Redirect     Query MongoDB
      │          │
      │          ▼
      │     Store in Redis
      │          │
      └──────────┘
          │
          ▼
      Redirect User
```

---

## 📊 Analytics Tracked

The application records:

* Total Clicks
* Unique Visitors
* Browser Usage
* Device Types
* Operating Systems
* Click Timestamps
* Referrer Information *(optional)*

---

## 📜 Available Scripts

### Backend

```bash
npm run dev
```

Start development server using Nodemon.

```bash
npm start
```

Start production server.

```bash
npm run test:performance
```

Run performance benchmarks.

---

### Frontend

```bash
npm run dev
```

Start development server.

```bash
npm run build
```

Create production build.

```bash
npm run preview
```

Preview production build locally.

---

## 🚀 Future Enhancements

* QR Code Generation
* Custom Domains
* Link Expiration
* Team Collaboration
* Rate Limiting
* Geo-location Analytics
* API Key Management
* Docker Support
* Kubernetes Deployment
* Real-Time Monitoring Dashboard

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the project
2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push to your branch

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## ⭐ Support

If you found this project useful, consider giving it a star on GitHub.

**Star ⭐ the repository and contribute to make it even better!**
