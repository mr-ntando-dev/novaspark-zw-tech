const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'novaspark2025';

let applications = [];
let contacts = [];
let subscribers = [];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF and DOC files allowed'));
  }
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function adminAuth(req, res, next) {
  const cookie = req.headers.cookie || '';
  if (cookie.includes('admin_auth=1')) return next();
  res.redirect('/admin/login');
}

app.get('/',        (req, res) => res.render('index'));
app.get('/about',   (req, res) => res.render('about'));
app.get('/services',(req, res) => res.render('services'));
app.get('/pricing', (req, res) => res.render('pricing'));
app.get('/careers', (req, res) => res.render('careers'));
app.get('/contact', (req, res) => res.render('contact'));
app.get('/blog',    (req, res) => res.render('blog'));

app.post('/careers/apply', upload.single('cv'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const entry = {
    id: Date.now(),
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone || '',
    position: req.body.position,
    message: req.body.message || '',
    file: req.file.filename,
    originalName: req.file.originalname,
    date: new Date().toISOString(),
    status: 'new'
  };
  applications.push(entry);
  console.log('New application:', entry);
  res.json({ success: true, message: "Application submitted successfully! We'll review it within 48 hours." });
});

app.post('/contact', (req, res) => {
  const msg = {
    id: Date.now(),
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone || '',
    service: req.body.service || '',
    message: req.body.message,
    date: new Date().toISOString(),
    read: false
  };
  contacts.push(msg);
  res.json({ success: true, message: "Message sent! We'll get back to you soon." });
});

app.post('/newsletter', (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ success: false, message: 'Email required' });
  if (subscribers.includes(email)) return res.json({ success: false, message: 'Already subscribed!' });
  subscribers.push(email);
  res.json({ success: true, message: 'Subscribed! Welcome to NOVASPARK_ZW updates.' });
});

app.get('/admin/login', (req, res) => res.render('admin/login', { error: null }));
app.post('/admin/login', (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) {
    res.setHeader('Set-Cookie', 'admin_auth=1; Path=/; HttpOnly; Max-Age=86400');
    res.redirect('/admin');
  } else {
    res.render('admin/login', { error: 'Wrong password. Try again.' });
  }
});
app.get('/admin/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'admin_auth=0; Path=/; Max-Age=0');
  res.redirect('/admin/login');
});

app.get('/admin', adminAuth, (req, res) => {
  res.render('admin/dashboard', {
    applications,
    contacts,
    subscribers,
    newApps: applications.filter(a => a.status === 'new').length,
    newContacts: contacts.filter(c => !c.read).length
  });
});

app.get('/admin/applications', adminAuth, (req, res) => {
  res.render('admin/applications', { applications });
});

app.post('/admin/applications/:id/status', adminAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const entry = applications.find(a => a.id === id);
  if (entry) { entry.status = req.body.status; entry.notes = req.body.notes || ''; }
  res.json({ success: true });
});

app.delete('/admin/applications/:id', adminAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const idx = applications.findIndex(a => a.id === id);
  if (idx !== -1) {
    try { fs.unlinkSync(path.join(__dirname, 'public/uploads', applications[idx].file)); } catch(e){}
    applications.splice(idx, 1);
  }
  res.json({ success: true });
});

app.get('/admin/cv/:filename', adminAuth, (req, res) => {
  const file = path.join(__dirname, 'public/uploads', req.params.filename);
  if (fs.existsSync(file)) res.download(file);
  else res.status(404).send('File not found');
});

app.get('/admin/contacts', adminAuth, (req, res) => {
  contacts.forEach(c => (c.read = true));
  res.render('admin/contacts', { contacts });
});

app.get('/admin/subscribers', adminAuth, (req, res) => {
  res.render('admin/subscribers', { subscribers });
});

app.listen(PORT, () => {
  console.log('NOVASPARK_ZW TECH running on port', PORT);
});
