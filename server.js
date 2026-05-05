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
app.get('/blog',      (req, res) => res.render('blog'));
app.get('/portfolio', (req, res) => res.render('portfolio'));
app.get('/status',    (req, res) => res.render('status'));
app.get('/faq',       (req, res) => res.render('faq'));
app.get('/developers',(req, res) => res.render('developers'));

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

// Quick quote requests
let quotes = [];
app.post('/quote', (req, res) => {  const q = { id: Date.now(), ...req.body, date: new Date().toISOString() };
  quotes.push(q);
  contacts.push({
    id: q.id,
    name: q.name || 'Quote Request',
    email: q.phone + ' (phone)',
    phone: q.phone,
    service: q.service,
    message: 'QUICK QUOTE: ' + (q.details || 'No details'),
    date: q.date,
    read: false
  });
  console.log('New quote request:', q);
  res.json({ success: true, message: "Quote received! We'll WhatsApp you within 2 hours." });
});

// Developer sign-ups
let developers = [];
app.post('/developers/join', (req, res) => {
  const dev = {
    id: Date.now(),
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone || '',
    role: req.body.role,
    github: req.body.github || '',
    portfolio: req.body.portfolio || '',
    stack: req.body.stack,
    experience: req.body.experience || '',
    availability: req.body.availability || '',
    bio: req.body.bio,
    date: new Date().toISOString(),
    status: 'new'
  };
  if (!dev.name || !dev.email || !dev.role || !dev.stack || !dev.bio) {
    return res.json({ success: false, message: 'Please fill in all required fields.' });
  }
  developers.push(dev);
  console.log('New developer sign-up:', dev);
  res.json({ success: true, message: "Welcome to the team! We'll add you to the WhatsApp group within 24 hours." });
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
    developers,
    newApps: applications.filter(a => a.status === 'new').length,
    newContacts: contacts.filter(c => !c.read).length
  });
});

app.get('/admin/applications', adminAuth, (req, res) => {
  res.render('admin/applications', { applications });
});

app.get('/admin/developers', adminAuth, (req, res) => {
  res.render('admin/developers', { developers });
});

app.post('/admin/developers/:id/status', adminAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const dev = developers.find(d => d.id === id);
  if (dev) dev.status = req.body.status;
  res.json({ success: true });
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
