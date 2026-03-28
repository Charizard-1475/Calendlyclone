const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { requireAuth } = require('./middleware/auth');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret123';

app.use(cors());
app.use(express.json());

// ==========================================
// AUTHENTICATION API
// ==========================================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, username } = req.body;
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });
    
    if (existing) return res.status(400).json({ error: 'Email or Username already taken' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, username }
    });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, username, name, email } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, name: user.name, email } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to login' });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, username: user.username, name: user.name, email: user.email });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ==========================================
// CORE CRUD (PROTECTED)
// ==========================================

// Event Types
app.get('/api/event-types', requireAuth, async (req, res) => {
  try {
    const events = await prisma.eventType.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(events);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch' }); }
});

app.get('/api/event-types/:slug', requireAuth, async (req, res) => {
    try {
      const eventType = await prisma.eventType.findUnique({
        where: { userId_slug: { userId: req.user.id, slug: req.params.slug } }
      });
      if (!eventType) return res.status(404).json({ error: 'Event type not found' });
      res.json(eventType);
    } catch (error) { res.status(500).json({ error: 'Failed to fetch' }); }
});

app.post('/api/event-types', requireAuth, async (req, res) => {
  try {
    const { name, duration, slug, url } = req.body;
    const event = await prisma.eventType.create({
      data: { name, duration, slug, url, userId: req.user.id }
    });
    res.status(201).json(event);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Slug already used by you' });
    res.status(500).json({ error: 'Failed to create' });
  }
});

app.delete('/api/event-types/:id', requireAuth, async (req, res) => {
  try {
    await prisma.eventType.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

// Availability
app.get('/api/availability', requireAuth, async (req, res) => {
  try {
    const avail = await prisma.availability.findMany({
      where: { userId: req.user.id },
      orderBy: [ { dayOfWeek: 'asc' }, { startTime: 'asc' } ]
    });
    res.json(avail);
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

app.post('/api/availability', requireAuth, async (req, res) => {
  try {
    const { availability } = req.body; 
    const data = availability.map(a => ({ ...a, userId: req.user.id }));
    
    await prisma.$transaction([
      prisma.availability.deleteMany({ where: { userId: req.user.id } }),
      prisma.availability.createMany({ data })
    ]);
    res.json({ message: 'Saved' });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

// Meetings
app.get('/api/meetings', requireAuth, async (req, res) => {
  try {
    // A meeting is tied to the host's eventType
    const meetings = await prisma.booking.findMany({
      where: { eventType: { userId: req.user.id } },
      include: { eventType: true },
      orderBy: { startTime: 'asc' }
    });
    res.json(meetings);
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

app.delete('/api/meetings/:id', requireAuth, async (req, res) => {
    try {
      await prisma.booking.update({
        where: { id: req.params.id },
        data: { status: 'CANCELLED' }
      });
      res.json({ message: 'Cancelled' });
    } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

// ==========================================
// PUBLIC API (OPEN)
// ==========================================

app.get('/api/public/users/:username', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      select: { 
        id: true, name: true, username: true,
        eventTypes: { select: { id: true, name: true, duration: true, slug: true } }
      }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// Get user availability & event type for booking
app.get('/api/public/users/:username/events/:slug', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { username: req.params.username } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const event = await prisma.eventType.findUnique({
      where: { userId_slug: { userId: user.id, slug: req.params.slug } }
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const availability = await prisma.availability.findMany({ where: { userId: user.id } });
    
    // For avoiding double booking, we fetch relevant meetings for the SAME event user
    const existingBookings = await prisma.booking.findMany({
      where: { eventType: { userId: user.id }, status: 'CONFIRMED' }
    });

    res.json({ event, availability, existingBookings });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

app.post('/api/public/bookings', async (req, res) => {
  try {
    const { eventTypeId, inviteeName, inviteeEmail, startTime, endTime } = req.body;
    
    const overlapping = await prisma.booking.findFirst({
      where: {
        AND: [
          { status: 'CONFIRMED' },
          {
            OR: [
              { startTime: { lt: new Date(endTime), gte: new Date(startTime) } },
              { endTime: { gt: new Date(startTime), lte: new Date(endTime) } },
              { startTime: { lte: new Date(startTime) }, endTime: { gte: new Date(endTime) } }
            ]
          }
        ]
      }
    });

    if (overlapping) return res.status(400).json({ error: 'Slot already booked' });

    const booking = await prisma.booking.create({
      data: { eventTypeId, inviteeName, inviteeEmail, startTime: new Date(startTime), endTime: new Date(endTime) }
    });
    res.status(201).json(booking);
  } catch (err) { res.status(500).json({ error: 'Booking failed' }); }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
