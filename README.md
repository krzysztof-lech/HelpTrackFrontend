# HelpTrack Frontend

## Overview

HelpTrack Frontend is the client-side application for the HelpTrack support ticket system, built with Angular 19. It provides an intuitive interface for managing support tickets, communicating between employees and support agents, and administering users — all secured with JWT-based authentication and role-based access control.

> The backend REST API (ASP.NET Core 8) is available here: [HelpTrack API](https://github.com/krzysztof-lech/HelpTrackAPI)

## Technologies
- Angular 19
- TypeScript 5.7
- RxJS 7.8
- Angular HTTP Client (with proxy configuration)

## Features

- JWT authentication with automatic token handling
- Role-based access control (Admin, SupportAgent, Employee)
- Full ticket management — create, view, update status, assign support agents
- In-ticket messaging system between employees and support staff
- Route guards protecting views based on authentication and role
- User management panel (Admin only)

## Project structure
```
src/
├── app/
│   ├── login/               # Login page
│   ├── home/                # Home dashboard with ticket chat
│   ├── my-tickets/          # Ticket list for logged-in employee
│   ├── tickets-panel/       # Ticket panel for support agents
│   ├── ticket-details/      # Ticket detail view (status, assignment, description)
│   ├── form-add-ticket/     # New ticket form
│   ├── users-list/          # User management (Admin only)
│   ├── enter-new-user/      # Add new user form (Admin only)
│   ├── services/
│   │   ├── api.service.ts           # Main API service (users & tickets)
│   │   └── ticket-message.service.ts # In-ticket messaging service
│   ├── auth.guard.ts        # Protects routes for authenticated users
│   ├── admin.guard.ts       # Restricts routes to Admin role only
│   ├── login.guard.ts       # Redirects logged-in users away from login
│   └── app.routes.ts        # Application routing configuration
└── assets/
```

## Routing
| Path | Component | Access |
|---|---|---|
| `/login` | LoginComponent | Public (redirects if logged in) |
| `/home` | HomeComponent | Authenticated |
| `/my-tickets` | MyTicketsComponent | Authenticated |
| `/tickets-panel` | TicketsPanelComponent | Authenticated |
| `/ticket/:id` | TicketDetailsComponent | Authenticated |
| `/new-ticket` | FormAddTicketComponent | Authenticated |
| `/users` | UsersListComponent | Admin only |
| `/enter-new-user` | EnterNewUserComponent | Admin only |

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- Angular CLI 19

```bash
npm install -g @angular/cli
```

### Installation
```bash
# Clone the repository
git clone https://github.com/krzysztof-lech/HelpTrackFrontend.git
cd HelpTrackFrontend

# Install dependencies
npm install
```
### Configuration
The application uses a proxy to forward API requests to the backend. Make sure the backend is running, then check the proxy.conf.json file in the root directory:

```json
{
  "/api": {
    "target": "https://localhost:{PORT}",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  },
  "/Auth": {
    "target": "https://localhost:{PORT}",
    "secure": false,
    "changeOrigin": true
  }
}
```

Adjust the target URL to match your backend address if needed.

### Running the Application
```bash
npm start
```
The app will be available at http://localhost:4200.

## Related Repository
- 🔗 **[HelpTrack API (Backend)](https://github.com/krzysztof-lech/HelpTrackAPI)** — ASP.NET Core 8 REST API implementation