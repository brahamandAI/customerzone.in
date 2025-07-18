# 🚀 Single Port Setup Guide - Rakshak Expense Management

## ✅ **Haan Bilkul! Ek Hi Port Par Dono Chal Sakte Hain**

Aapke Rakshak Securitas expense management system ko **ek hi port** par chalane ke liye hum **Proxy Configuration** use kar rahe hain.

## 🔧 **Configuration Details**

### **Port Configuration:**
- **Frontend**: `http://localhost:3000` (React App)
- **Backend**: `http://localhost:5001` (Node.js API)
- **Proxy**: Frontend se backend tak automatic forwarding

### **How It Works:**
1. **Frontend** port 3000 par chalega
2. **Backend** port 5001 par chalega  
3. **Proxy** automatically API calls ko frontend se backend tak forward karega
4. **User** sirf `http://localhost:3000` access karega

## 🚀 **Quick Start**

### **1. Setup Commands:**
```bash
# Install dependencies
npm run install-all

# Start both frontend and backend
npm run dev-single-port
```

### **2. Access Points:**
- **Main App**: http://localhost:3000
- **Backend API**: http://localhost:5001/api
- **Health Check**: http://localhost:3000/api/health

## 📋 **Available Scripts**

### **Root Package.json Scripts:**
```json
{
  "dev-single-port": "concurrently \"npm run server-single\" \"npm run client-single\"",
  "server-single": "cd backend && PORT=5001 npm run dev",
  "client-single": "cd frontend && PORT=3000 npm start"
}
```

### **Frontend Proxy Configuration:**
```json
{
  "proxy": "http://localhost:5001"
}
```

## 🔄 **How Proxy Works**

### **Before Proxy:**
```
Frontend (3000) → API Call → Backend (5001) ❌ CORS Error
```

### **After Proxy:**
```
Frontend (3000) → API Call → Proxy → Backend (5001) ✅ Working
```

### **Example API Calls:**
```javascript
// Frontend mein API calls
const response = await fetch('/api/health');  // Proxy automatically forwards to backend
const data = await fetch('/api/auth/login');  // Same here
```

## 🛠️ **Manual Setup (If Needed)**

### **1. Backend Configuration:**
```bash
cd backend
# Create .env file with PORT=5001
echo "PORT=5001" > .env
```

### **2. Frontend Configuration:**
```bash
cd frontend
# Add proxy to package.json
echo '"proxy": "http://localhost:5001"' >> package.json
```

### **3. Start Servers:**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm start
```

## 🧪 **Testing Setup**

### **Test Script:**
```bash
node test-single-port.js
```

### **Manual Testing:**
1. **Backend Test**: http://localhost:5001/api/health
2. **Frontend Test**: http://localhost:3000
3. **Proxy Test**: http://localhost:3000/api/health

## 🔍 **Troubleshooting**

### **Common Issues:**

**1. Port Already in Use:**
```bash
# Kill existing processes
Get-Process -Name "node" | Stop-Process -Force
```

**2. MongoDB Not Running:**
```bash
# Start MongoDB
mongod
```

**3. CORS Issues:**
- Backend CORS configuration already updated
- Frontend proxy already configured

**4. Proxy Not Working:**
```bash
# Restart both servers
npm run dev-single-port
```

## 📊 **Benefits of Single Port Setup**

### **✅ Advantages:**
1. **No CORS Issues** - Proxy handles cross-origin requests
2. **Simplified Development** - One command to start both
3. **Production Ready** - Easy deployment configuration
4. **Better UX** - Single URL for users
5. **Security** - Backend not directly exposed

### **🔧 Development Workflow:**
1. Run `npm run dev-single-port`
2. Access app at `http://localhost:3000`
3. All API calls automatically proxied
4. Real-time updates work seamlessly

## 🎯 **Production Deployment**

### **For Production:**
```bash
# Build frontend
npm run build

# Serve static files from backend
# Backend will serve React build files
```

### **Environment Variables:**
```env
NODE_ENV=production
PORT=5001
FRONTEND_URL=https://yourdomain.com
```

## 🎉 **Success Indicators**

✅ **Backend running on port 5001**  
✅ **Frontend running on port 3000**  
✅ **Proxy forwarding API calls**  
✅ **No CORS errors**  
✅ **Real-time features working**  
✅ **Database connected**  

## 🚀 **Ready to Use!**

Aapka Rakshak Securitas expense management system **ek dum perfect** single port configuration ke saath ready hai!

**Access your app at: http://localhost:3000** 