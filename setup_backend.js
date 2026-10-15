const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const backendDir = 'C:\\DinoyoCraftBE';

// Helper to create directory
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// Helper to create files
function createFile(filePath, content) {
    fs.writeFileSync(filePath, content.trim() + '\n', 'utf8');
}

ensureDir(backendDir);
ensureDir(path.join(backendDir, 'src', 'middlewares'));
ensureDir(path.join(backendDir, 'src', 'controllers'));
ensureDir(path.join(backendDir, 'src', 'routes'));
ensureDir(path.join(backendDir, 'src', 'utils'));

// 1. package.json
const pkgJson = {
    name: "dinoyocraft-backend",
    version: "1.0.0",
    description: "Backend API for DinoyoCraft with Security Layers",
    main: "src/index.ts",
    scripts: {
        "start": "node dist/index.js",
        "dev": "nodemon src/index.ts",
        "build": "tsc"
    },
    dependencies: {
        "express": "^4.19.0",
        "cors": "^2.8.5",
        "dotenv": "^16.4.5",
        "helmet": "^7.1.0",
        "express-rate-limit": "^7.2.0",
        "cookie-parser": "^1.4.6",
        "jsonwebtoken": "^9.0.2",
        "zod": "^3.22.4"
    },
    devDependencies: {
        "typescript": "^5.4.2",
        "ts-node": "^10.9.2",
        "nodemon": "^3.1.0",
        "@types/express": "^4.17.21",
        "@types/cors": "^2.8.17",
        "@types/cookie-parser": "^1.4.7",
        "@types/jsonwebtoken": "^9.0.6",
        "@types/node": "^20.11.25"
    }
};
createFile(path.join(backendDir, 'package.json'), JSON.stringify(pkgJson, null, 2));

// 2. tsconfig.json
const tsconfig = {
    "compilerOptions": {
        "target": "es2022",
        "module": "commonjs",
        "outDir": "./dist",
        "rootDir": "./src",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true
    },
    "include": ["src/**/*"]
};
createFile(path.join(backendDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

// 3. .env
createFile(path.join(backendDir, '.env'), `
PORT=5000
JWT_SECRET=super_secret_dinoyocraft_key
NODE_ENV=development
CLIENT_URL=http://localhost:3000
`);

// 4. src/index.ts (Entry Point with Security Layers)
createFile(path.join(backendDir, 'src', 'index.ts'), `
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. SECURITY HEADERS (Helmet)
app.use(helmet());

// 2. RATE LIMITING (Mencegah Brute Force / DDoS)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 100, // batasi tiap IP maksimal 100 request per windowMs
    message: "Terlalu banyak request dari IP ini, coba lagi nanti."
});
app.use('/api', limiter);

// 3. CORS & SECURE COOKIES
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true // Mengizinkan cookie (Secure Cookies)
}));
app.use(cookieParser());

// Body Parser
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Root Endpoint
app.get('/', (req, res) => {
    res.json({ message: 'DinoyoCraft API is running securely!' });
});

app.listen(PORT, () => {
    console.log(\`Server berjalan di http://localhost:\${PORT}\`);
    console.log('Security Layers Active: Helmet, Rate Limiter, CORS, HttpOnly Cookies');
});
`);

// 5. src/middlewares/auth.ts (JWT Middleware)
createFile(path.join(backendDir, 'src', 'middlewares', 'auth.ts'), `
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
    // Mengecek token dari header Authorization ATAU dari Secure Cookies
    const authHeader = req.headers.authorization;
    const token = (authHeader && authHeader.split(' ')[1]) || req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Akses ditolak: Token tidak ditemukan' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Token tidak valid atau kedaluwarsa' });
    }
};
`);

// 6. src/middlewares/validate.ts (Input Validation with Zod)
createFile(path.join(backendDir, 'src', 'middlewares', 'validate.ts'), `
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

// Middleware validasi input universal menggunakan Zod
export const validate = (schema: AnyZodObject) => 
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error: any) {
            return res.status(400).json({ 
                message: 'Validasi Input Gagal', 
                errors: error.errors 
            });
        }
    };
`);

// 7. src/routes/auth.routes.ts
createFile(path.join(backendDir, 'src', 'routes', 'auth.routes.ts'), `
import { Router } from 'express';
import { login, register, getProfile } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { authenticateJWT } from '../middlewares/auth';
import { z } from 'zod';

const router = Router();

// Skema validasi input untuk Register
const registerSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Nama wajib diisi'),
        email: z.string().email('Format email tidak valid'),
        password: z.string().min(6, 'Password minimal 6 karakter'),
        role: z.enum(['admin', 'mitra', 'pengunjung']).optional(),
        shop_name: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        year_started: z.number().optional()
    })
});

// Skema validasi input untuk Login
const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Format email tidak valid'),
        password: z.string().min(6, 'Password minimal 6 karakter')
    })
});

// Endpoint Register
router.post('/register', validate(registerSchema), register);

// Endpoint Login (Input Validation layer diaktifkan)
router.post('/login', validate(loginSchema), login);

// Endpoint Terlindungi (JWT Auth layer diaktifkan)
router.get('/profile', authenticateJWT, getProfile);

export default router;
`);

// 8. src/controllers/auth.controller.ts
createFile(path.join(backendDir, 'src', 'controllers', 'auth.controller.ts'), `
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
    const { name, email, password, role = 'mitra', shop_name, address, phone, year_started } = req.body;

    const user = {
        id: Date.now(),
        name,
        email,
        role,
        shop_name,
        address,
        phone,
        year_started,
        created_at: new Date().toISOString()
    };

    return res.status(201).json({
        success: true,
        message: 'Pendaftaran mitra berhasil! Silakan masuk ke akun Anda.',
        data: { user }
    });
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Simulasi Cek Database (Mock)
    if (email === 'admin@dinoyocraft.com' && password === 'Admin123') {
        const user = { id: 1, name: 'Admin Utama', role: 'admin' };
        
        // Buat JWT Token
        const token = jwt.sign(user, process.env.JWT_SECRET as string, { expiresIn: '1h' });

        // Set Secure Cookie
        res.cookie('token', token, {
            httpOnly: true, // Tidak bisa diakses oleh XSS (javascript)
            secure: process.env.NODE_ENV === 'production', // Berlaku di HTTPS pada production
            sameSite: 'strict', // Melindungi dari CSRF
            maxAge: 60 * 60 * 1000 // 1 jam
        });

        return res.json({ success: true, message: 'Login Berhasil', token, user });
    }

    if (email && password) {
        // Simulasi Login Mitra
        const user = { id: 2, name: 'Mitra Pengrajin', email, role: 'mitra' };
        const token = jwt.sign(user, process.env.JWT_SECRET as string, { expiresIn: '1h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000
        });

        return res.json({ success: true, message: 'Login Berhasil', token, user });
    }

    return res.status(401).json({ success: false, message: 'Email atau password salah' });
};

export const getProfile = async (req: Request, res: Response) => {
    // Karena sudah melewati middleware authenticateJWT, user pasti ada
    const user = (req as any).user;
    return res.json({ success: true, message: 'Profil berhasil diambil', user });
};
`);

console.log("Scaffolding backend completed successfully.");
