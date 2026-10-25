# AIgnite Social 🚀

### AI-Powered Social Media Management for Boutique Hotels

AIgnite Social is an AI-powered platform designed to help boutique hotels simplify their social media management. From generating engaging captions to creating content and scheduling posts, AIgnite helps hotels maintain a consistent online presence with less manual effort.

---

## ✨ Features

- **AI Content Generation** — Generate engaging captions and social media post ideas.
- **AI Image Generation** — Create attractive visuals for hotel promotions and special occasions.
- **Content Customization** — Tailor social media content to match your hotel's brand and style.
- **Post Scheduling** — Plan and schedule social media content in advance.
- **Social Media Account Management** — Manage connected social media accounts from one platform.
- **Dashboard** — Access content creation, scheduling, and account management tools in one place.
- **User Authentication** — Secure access to platform features.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | Frontend user interface |
| TypeScript | Type-safe development |
| Vite | Frontend development and build tooling |
| Node.js | Backend runtime |
| Express.js | Backend API |
| MongoDB | Database |
| Mongoose | MongoDB object modeling |
| Cloudinary | Media and image management |
| Zernio | Social media integration |

## 📁 Project Structure

```text
AIgnite-Social/
├── client/
│   ├── public/
│   └── src/
│       ├── api/
│       ├── assets/
│       ├── components/
│       ├── context/
│       └── pages/
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   └── services/
├── .gitignore
└── README.md
```

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/)
- npm
- [MongoDB](https://www.mongodb.com/) or a MongoDB Atlas account

### 1. Clone the Repository

```bash
git clone https://github.com/roh31t/AIgnite-Social.git
cd AIgnite-Social
```

### 2. Set Up the Backend

Open a terminal and run:

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory and add the environment variables required by your configuration.

Example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Configure any additional environment variables required for Cloudinary, Zernio, and other services used by the application.

Start the backend using the appropriate script defined in `server/package.json`.

### 3. Set Up the Frontend

Open a separate terminal from the project root and run:

```bash
cd client
npm install
```

Configure the frontend environment variables if required by your application.

Start the frontend using the appropriate script defined in `client/package.json`.

### 4. Access the Application

Once the frontend and backend are running, open the local URL displayed in your terminal.

> **Note:** Check the `package.json` files and project configuration for the exact startup commands and environment variable names.

## 🔐 Environment Configuration

- Store credentials and API keys in environment files.
- Never commit real `.env` files or expose secrets publicly.
- Use `.env.example` to document required environment variables without including sensitive values.
- Keep your database credentials and authentication secrets private.

## 🔮 Future Improvements

- Social media performance analytics
- AI-powered content recommendations
- Advanced content calendar
- Multi-hotel workspace management
- Enhanced automated publishing workflows

## 👨‍💻