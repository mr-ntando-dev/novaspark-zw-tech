const express = require('express');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Multer config for CV uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF and DOC files allowed'));
  }
});

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.get('/', (req, res) => res.render('index'));
app.get('/about', (req, res) => res.render('about'));
app.get('/services', (req, res) => res.render('services'));
app.get('/pricing', (req, res) => res.render('pricing'));
app.get('/careers', (req, res) => res.render('careers'));
app.get('/contact', (req, res) => res.render('contact'));

// CV Upload endpoint
app.post('/careers/apply', upload.single('cv'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  // In production, save applicant data to a database
  console.log('New application:', {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    position: req.body.position,
    file: req.file.filename
  });
  res.json({ success: true, message: 'Application submitted successfully!' });
});

// Contact form endpoint
app.post('/contact', (req, res) => {
  console.log('New contact message:', req.body);
  res.json({ success: true, message: 'Message sent! We\'ll get back to you soon.' });
});

app.listen(PORT, () => {
  console.log(`🚀 NOVASPARK_ZW TECH running on port ${PORT}`);
});
