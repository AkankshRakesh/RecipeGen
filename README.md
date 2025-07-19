# 🍳 [RecipeGen - AI-Powered Recipe Discovery Platform](https://recipegen-theta.vercel.app/)

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-13+-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</div>

<div align="center">
  <h3>Transform your available ingredients into delicious recipes with AI-powered suggestions</h3>
  <p>A modern web application that helps you discover recipes based on what you have in your kitchen. Deployed at the link: https://recipegen-theta.vercel.app/</p>
</div>


## ✨ Features

### 🔍 **Smart Recipe Discovery**
- **Ingredient-Based Search**: Enter ingredients you have and discover recipes that use them
- **Recipe Matching**: Advanced algorithm to find recipes with maximum ingredient overlap
- **Smart Suggestions**: Get alternative ingredient suggestions when items aren't found
- **Random Recipe Discovery**: Explore new recipes when you're feeling adventurous

### 👤 **User Authentication & Personalization**
- **Multiple Login Options**: Email/password and Google OAuth authentication
- **Persistent Sessions**: Stay logged in across browser sessions
- **Secure JWT Tokens**: Industry-standard authentication

### 💾 **Recipe Management**
- **Save Favorites**: Bookmark recipes for easy access later
- **Personal Recipe Collection**: Build your own curated recipe library
- **Cloud Sync**: Access your saved recipes from any device

### 🛒 **Smart Grocery Lists**
- **Recipe-Based Organization**: Ingredients automatically grouped by recipe
- **Duplicate Prevention**: Smart filtering to avoid duplicate ingredients
- **Interactive Checklist**: Mark items as completed while shopping
- **Persistent Storage**: Your grocery lists sync across devices

### 🎨 **Modern User Experience**
- **Responsive Design**: Perfect experience on desktop, tablet, and mobile
- **Dark/Light Mode**: Toggle between themes for comfortable viewing
- **Smooth Animations**: Polished interactions and transitions
- **Accessible UI**: Built with accessibility best practices

### 📱 **Recipe Details**
- **Comprehensive Information**: Detailed instructions, ingredients, and nutritional info
- **High-Quality Images**: Visual recipe previews
- **Cooking Metadata**: Prep time, difficulty level, servings, and ratings
- **External Links**: Access to video tutorials and original sources


## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account or local MongoDB installation
- Google OAuth credentials (optional, for Google login)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AkankshRakesh/RecipeGen.git
   cd RecipeGen
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/recipegen

   # JWT Secret (generate a random string)
   JWT_SECRET=your-super-secret-jwt-key-here

   # Google OAuth (optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # App URL
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Set up MongoDB**
   
   Create these collections in your MongoDB database:
   - `users` - For user accounts and saved recipes
   - `groceryLists` - For user grocery lists

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)


## 🏗️ Tech Stack

### **Frontend**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide Icons** - Beautiful SVG icons

### **Backend**
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - NoSQL database
- **JWT** - Secure authentication tokens
- **bcrypt** - Password hashing

### **External APIs**
- **TheMealDB API** - Recipe data and ingredient information
- **Google OAuth 2.0** - Social authentication

### **Development Tools**
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking


## 📁 Project Structure

```
RecipeGen/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── groceryList/          # Grocery list management
│   │   ├── login/                # Login endpoints
│   │   └── save/                 # Recipe saving endpoints
│   ├── login/                    # Login page
│   ├── signup/                   # Signup page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # Reusable UI components
│   ├── ui/                       # Base UI components
│   ├── GeneratorTab.tsx          # Recipe discovery interface
│   ├── GroceryList.tsx           # Grocery list management
│   ├── SavedRecipes.tsx          # Saved recipe collection
│   ├── recipe-card.tsx           # Recipe display component
│   ├── recipe-detail-modal.tsx   # Recipe detail view
│   └── theme-toggle.tsx          # Dark/light mode toggle
├── lib/                          # Utility libraries
│   ├── mongodb.ts                # Database connection
│   ├── jwt.ts                    # JWT utilities
│   ├── types.ts                  # TypeScript type definitions
│   └── utils.ts                  # Helper functions
└── public/                       # Static assets
```


## 🔧 API Endpoints

### **Authentication**
- `POST /api/login` - User login with email/password
- `GET /api/login` - Google OAuth redirect
- `POST /api/signup` - User registration

### **Recipe Management**
- `POST /api/save` - Save/unsave recipes
- `GET /api/save` - Get user's saved recipes

### **Grocery Lists**
- `POST /api/groceryList` - Add ingredients to grocery list
- `GET /api/groceryList` - Get user's grocery list
- `PUT /api/groceryList` - Update grocery list items


## 🎯 Usage Guide

### **Discovering Recipes**
1. Enter ingredients you have in your kitchen
2. Click "Add Ingredient" or press Enter
3. Browse generated recipe suggestions
4. View detailed recipe information
5. Save recipes you like for later

### **Managing Grocery Lists**
1. Click "Add to List" on any recipe card
2. Ingredients are automatically organized by recipe
3. Navigate to the "Grocery List" tab
4. Check off items as you shop
5. Remove completed items when done

### **User Accounts**
1. Sign up with email/password or Google
2. Access saved recipes across devices
3. Maintain persistent grocery lists
4. Personalized recipe recommendations


## 🌐 External Integrations

### **TheMealDB API**
- Recipe database with 1000+ recipes
- Ingredient validation and suggestions
- Recipe details, images, and instructions
- Nutritional information and metadata

### **Google OAuth**
- Secure social authentication
- Profile information access
- Simplified user onboarding


## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **Input Validation** - Server-side data validation
- **CORS Protection** - Cross-origin request security
- **Environment Variables** - Secure credential storage


## 🚀 Deployment

### **Vercel (Recommended)**
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### **Other Platforms**
- Compatible with any Node.js hosting platform
- Ensure MongoDB connection and environment variables are configured
- Build command: `npm run build`
- Start command: `npm start`


## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/AkankshRakesh">Akanksh Rakesh</a></p>
  <p>⭐ Star this repository if you found it helpful!</p>
</div>
