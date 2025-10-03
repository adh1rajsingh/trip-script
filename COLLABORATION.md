# TripScript Collaboration Feature

## 🎉 New Feature: Real-time Collaboration

This feature allows multiple users to collaborate on trip planning in real-time, similar to Google Docs.

### Features

1. **Invite Collaborators** - Invite other users by email to collaborate on your trips
2. **Role-based Access** - Assign roles (Owner, Editor, Viewer) with different permissions:
   - **Owner**: Full control, can manage collaborators
   - **Editor**: Can edit trip details and itinerary
   - **Viewer**: Can view the trip but not make changes
3. **Real-time Updates** - See changes as they happen using Pusher
4. **Active Users** - See who's currently viewing/editing the trip
5. **Activity Feed** - Track all changes made to the trip
6. **Permission Controls** - Secure access with proper authorization checks

### Setup Instructions

#### 1. Install Dependencies

Already installed:
```bash
npm install pusher pusher-js @tanstack/react-query
```

#### 2. Set up Pusher

1. Go to [pusher.com](https://pusher.com) and create a free account
2. Create a new Pusher Channels app
3. Copy your app credentials to `.env.local`:

```env
PUSHER_APP_ID=your_app_id
PUSHER_SECRET=your_secret
NEXT_PUBLIC_PUSHER_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster
```

#### 3. Run Database Migration

Generate and push the new collaboration tables:

```bash
npm run db:generate
npm run db:push
```

This creates the following tables:
- `trip_collaborators` - Stores who can access each trip
- `trip_activity` - Logs all actions for activity feed
- `user_presence` - Tracks who's online

#### 4. Start the Development Server

```bash
npm run dev
```

### How to Use

#### Inviting Collaborators

1. Open any trip you own
2. Click the floating collaboration button (bottom right with Users icon)
3. Click "Invite Collaborator"
4. Enter the email of a registered user
5. Select their role (Editor or Viewer)
6. Click "Send Invite"

#### Managing Collaborators

- **View all collaborators**: Open the collaboration panel
- **Change roles**: Click the dropdown next to a collaborator (owners only)
- **Remove collaborators**: Click "Remove" (owners only)

#### Real-time Features

- **Active users**: See green indicators next to currently online users
- **Instant updates**: Changes made by collaborators appear immediately
- **Activity feed**: See a chronological log of all changes

### Architecture

```
Components:
├── CollaborationPanel.tsx     - Main sliding panel UI
├── CollaboratorsList.tsx      - List of collaborators with management
├── InviteCollaboratorModal.tsx - Modal for inviting new collaborators
├── ActivityFeed.tsx           - Shows recent activity
├── ActiveUsers.tsx            - Shows who's currently online

Server Actions:
├── collaborationActions.ts    - Server-side collaboration logic
    ├── inviteCollaborator()
    ├── removeCollaborator()
    ├── updateCollaboratorRole()
    ├── getCollaborators()
    ├── getTripActivity()
    └── checkUserAccess()

Real-time:
├── lib/pusher.ts              - Pusher client/server setup
└── hooks/useRealtimeCollaboration.ts - React hook for real-time updates
```

### Database Schema

**trip_collaborators**
- Links users to trips with specific roles
- Tracks who invited whom and when

**trip_activity**
- Logs all actions (create, update, delete, invite, etc.)
- Stores metadata for detailed activity tracking

**user_presence**
- Tracks who's currently viewing each trip
- Updates in real-time via Pusher

### Security

- All server actions check user permissions
- Role-based access control (RBAC)
- Only owners can manage collaborators
- Only owners and editors can modify trips
- Viewers have read-only access

### Future Enhancements

- [ ] Email notifications for invitations
- [ ] Real-time cursor positions (collaborative editing)
- [ ] Conflict resolution for simultaneous edits
- [ ] Commenting system
- [ ] Undo/redo functionality
- [ ] Export activity log
- [ ] Slack/Discord integration

### Troubleshooting

**Q: Collaborators can't see the trip**
- Ensure they have a registered account with the email you invited
- Check their role and permissions in the collaboration panel

**Q: Real-time updates not working**
- Verify Pusher credentials in `.env.local`
- Check browser console for connection errors
- Ensure Pusher app is active (not over free tier limits)

**Q: Can't invite collaborators**
- User must have an account with the exact email
- You must be the owner or an editor of the trip
- Check that the user isn't already a collaborator

### Technology Stack

- **Real-time**: Pusher Channels
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Clerk
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
