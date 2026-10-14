const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware configuration to read form text and system data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Temporary system database mock arrays
let bookings = [
  { id: 1, guestName: "John Doe", roomNumber: "101", checkIn: "2026-10-15", checkOut: "2026-10-20", status: "Active" },
  { id: 2, guestName: "Jane Smith", roomNumber: "204", checkIn: "2026-10-18", checkOut: "2026-10-22", status: "Active" }
];

let services = [
  { id: 1, roomNum: "101", request: "Extra towels", time: "10:30 AM", status: "Pending" },
  { id: 2, roomNum: "204", request: "Room service lunch", time: "12:15 PM", status: "Completed" }
];

// Single web endpoint rendering the comprehensive visual dashboard layout
app.get('/', (req, res) => {
  // Generate HTML table logs dynamically from live arrays
  let bookingRows = bookings.map(b => `
    <tr>
      <td data-label="ID">${b.id}</td>
      <td data-label="Guest"><strong>${b.guestName}</strong></td>
      <td data-label="Room"><span class="badge room">Room ${b.roomNumber}</span></td>
      <td data-label="Check-In">${b.checkIn}</td>
      <td data-label="Check-Out">${b.checkOut}</td>
      <td data-label="Actions">
        <form action="/checkout/${b.id}" method="POST" style="display:inline;">
          <button type="submit" class="btn-action danger">Check-Out</button>
        </form>
      </td>
    </tr>
  `).join('');

  let serviceRows = services.map(s => `
    <tr>
      <td data-label="Room"><strong>Room ${s.roomNum}</strong></td>
      <td data-label="Request">${s.request}</td>
      <td data-label="Time">${s.time}</td>
      <td data-label="Status"><span class="badge status-${s.status.toLowerCase()}">${s.status}</span></td>
    </tr>
  `).join('');

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Grand Horizon Resort - Management Portal</title>
      <style>
        * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 0; }
        body { background-color: #f4f6f9; color: #333; padding: 15px; }
        .container { max-width: 1100px; margin: 0 auto; }
        header { background: #1a252f; color: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        header h1 { font-size: 1.8rem; margin-bottom: 5px; }
        header p { color: #bdc3c7; font-size: 0.9rem; }
        .grid-layout { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 25px; }
        .card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); border: 1px solid #eef2f5; }
        h2 { margin-bottom: 15px; color: #2c3e50; font-size: 1.2rem; border-bottom: 2px solid #f4f6f9; padding-bottom: 8px; }
        .form-group { display: flex; flex-direction: column; gap: 12px; margin-bottom: 15px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        input, select { padding: 12px; border: 1px solid #dcdde1; border-radius: 6px; font-size: 0.95rem; width: 100%; background-color: #fafbfc; transition: all 0.3s; }
        input:focus, select:focus { border-color: #3498db; outline: none; background-color: #fff; }
        button.btn-submit { background: #2ecc71; color: white; border: none; padding: 14px; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%; font-size: 1rem; box-shadow: 0 3px 6px rgba(46,204,113,0.2); }
        button.btn-submit:hover { background: #27ae60; }
        button.btn-submit.blue { background: #3498db; box-shadow: 0 3px 6px rgba(52,152,219,0.2); }
        button.btn-submit.blue:hover { background: #2980b9; }
        .table-wrapper { width: 100%; overflow-x: auto; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left; }
        th, td { padding: 14px 12px; border-bottom: 1px solid #f1f2f6; }
        th { background-color: #f8f9fa; color: #7f8c8d; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.8px; font-weight: 700; }
        tr:hover { background-color: #fcfcfd; }
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600; display: inline-block; }
        .badge.room { background: #ebf5fb; color: #2980b9; }
        .status-pending { background: #fef9e7; color: #f39c12; }
        .status-completed { background: #e8f8f5; color: #117a65; }
        .btn-action { border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: bold; }
        .btn-action.danger { background: #fdad9e; color: #c0392b; }
        .btn-action.danger:hover { background: #e74c3c; color: white; }

        @media (max-width: 768px) {
          table, thead, tbody, th, td, tr { display: block; } 
          th { display: none; } 
          tr { margin-bottom: 15px; border: 1px solid #e1e8ed; padding: 12px; border-radius: 8px; background: #fff; } 
          td { text-align: right; padding: 8px 0; position: relative; border-bottom: none; display: flex; justify-content: space-between; align-items: center; } 
          td::before { content: attr(data-label); font-weight: bold; color: #7f8c8d; font-size: 0.8rem; text-transform: uppercase; } 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1>🏨 Grand Horizon Luxury Resort</h1>
          <p>Integrated Front Desk & Operational Command Center</p>
        </header>

        <div class="grid-layout">
          <!-- Column 1: Check-in Form -->
          <div class="card">
            <h2>Front Desk Registration</h2>
            <form action="/book" method="POST">
              <div class="form-group">
                <input type="text" name="guestName" placeholder="Guest Full Name" required>
                <input type="number" name="roomNumber" placeholder="Assign Room Number" required>
                <div class="form-row">
                  <div>
                    <label style="font-size:0.75rem; color:#7f8c8d;">Check-In</label>
                    <input type="date" name="checkIn" required>
                  </div>
                  <div>
                    <label style="font-size:0.75rem; color:#7f8c8d;">Check-Out</label>
                    <input type="date" name="checkOut" required>
                  </div>
                </div>
              </div>
              <button type="submit" class="btn-submit">Process Room Check-In</button>
            </form>
          </div>

          <!-- Column 2: Housekeeping Form -->
          <div class="card">
            <h2>Service & Housekeeping Orders</h2>
            <form action="/service" method="POST">
              <div class="form-group">
                <input type="number" name="roomNum" placeholder="Target Room Number" required>
                <select name="request" required>
                  <option value="" disabled selected>Select Task Assignment</option>
                  <option value="Luggage Assistance">Luggage Assistance</option>
                  <option value="Room Cleaning / Make Up">Room Cleaning / Make Up</option>
                  <option value="Fresh Towels & Linens">Fresh Towels & Linens</option>
                  <option value="Food & Beverage Delivery">Food & Beverage Delivery</option>
                  <option value="Maintenance Request">Maintenance Request</option>
                </select>
                <input type="text" name="time" placeholder="Target Schedule Time (e.g., Immediate, 6:00 PM)">
              </div>
              <button type="submit" class="btn-submit blue">Dispatch Service Ticket</button>
            </form>
          </div>
        </div>

        <!-- Master Occupancy Tracker Panel -->
        <div class="card" style="margin-bottom: 25px;">
          <h2>Active Room Occupancy Log</h2>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Guest Name</th>
                  <th>Assigned Unit</th>
                  <th>Arrival Date</th>
                  <th>Departure Date</th>
                  <th>Management Action</th>
                </tr>
              </thead>
              <tbody>
                ${bookingRows.length > 0 ? bookingRows : '<tr><td colspan="6" style="text-align:center; color:#999; padding: 30px;">No occupied resort inventory recorded.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Live Operations Tracker Panel -->
        <div class="card">
          <h2>Active Operations Service Queue</h2>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Resort Unit</th>
                  <th>Requested Assignment Task</th>
                  <th>Scheduled Dispatched Deadline</th>
                  <th>Current State</th>
                </tr>
              </thead>
              <tbody>
                ${serviceRows.length > 0 ? serviceRows : '<tr><td colspan="4" style="text-align:center; color:#999; padding: 30px;">All facility operations clear.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </body>
    </html>
  `);
});

// App Engine submission processing routes
app.post('/book', (req, res) => {
  const { guestName, roomNumber, checkIn, checkOut } = req.body;
  if (guestName && roomNumber && checkIn && checkOut) {
    bookings.push({
      id: bookings.length + 1,
      guestName,
      roomNumber,
      checkIn,
      checkOut,
      status: "Active"
    });
  }
  res.redirect('/');
});

app.post('/service', (req, res) => {
