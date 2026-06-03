# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (ASP.NET Core 8)
```bash
cd Backend/EmailTrackingAPI
dotnet restore
dotnet run          # runs on http://localhost:5000
dotnet build
dotnet publish -c Release -o ./publish
```

### Frontend (React + Vite)
```bash
cd Frontend/email-tracking-app
npm install
npm run dev         # dev server (hot reload)
npm run build       # production build
npm run preview     # preview production build locally
```

### Database
Schema lives in `Backend/Database/schema.sql`. To reset the `Companies` table without touching `Users`, use `Backend/Database/fix_schema.sql`. There are no EF migrations — schema changes are applied manually via SQL scripts run directly against the SQL Server instance.

---

## Architecture

### Overview
Full-stack internal sales outreach tracker. Single `Companies` table stores both **Client** and **Agent** record types — differentiated only by the `RecordType` column. No separate tables per type.

### Auth model
There is **no JWT in use** despite config existing in `appsettings.json`. Authentication is purely session-based via `localStorage`. After login, the frontend passes `userId`, `isDirector`, and `RecordType` as **plain HTTP request headers** on every API call. The backend reads these directly from `Request.Headers`. The `[Authorize]` attribute is not used.

### API routing
All routes are prefixed `/apiEmail/` (not `/api/`). The app is deployed under a subpath — the frontend Vite base and React Router basename are both set to `/EmailTrackingApp/`. The API base URL in `src/services/api.js` is `/EmailTrackingApp/apiEmail`.

### Role system
`IsDirector` (bool) is the only role distinction:
- **Employees**: see all records (filtering by userId is currently commented out in `CompanyService.GetCompanies`), capped at 3 `isApproved === 0` records per tab before adding more
- **Directors**: see the Approve/Unapprove button in the detail modal; can edit/delete any record

### Company lifecycle
1. Created with basic fields only (Name, Region, Link, Emails). Status defaults to `"Pending"`, `isApproved` defaults to `0`.
2. Employee fills in sales research fields (PainPoints, ExactNeeds, BuyingTrigger, BestPitchAngle, WhyStrongFit) and the email draft (EmailSub, EmailBody) via the detail modal.
3. Director opens the record and clicks **Approve** → sets `isApproved = 1`.
4. Once approved, the Status dropdown unlocks and the employee manually advances it through: `Pending → Email Sent → First Follow-up email sent → Second Follow-up email sent → Interested / Inactive`.

The `PUT /{id}/mark-as-pending` endpoint (sets Status = "Pending" and stamps `LastEmailSentAt`) is defined but not called from any frontend component.

### DbContext notes
`Company.Username` is **not a DB column** — it is decorated with `.Ignore()` in `ApplicationDbContext` and populated via a manual LINQ join in `CompanyService.GetCompanies`. Do not try to query or filter on it at the EF level.

### Key files
| File | Purpose |
|---|---|
| `Backend/EmailTrackingAPI/Models/Models.cs` | All request/response DTOs and entity models |
| `Backend/EmailTrackingAPI/Services/CompanyService.cs` | All business logic and DB queries |
| `Backend/EmailTrackingAPI/Data/ApplicationDbContext.cs` | EF Core config — includes the `.Ignore(c => c.Username)` mapping |
| `Frontend/src/services/api.js` | All HTTP calls; headers pattern used instead of bearer tokens |
| `Frontend/src/components/CompanyDetailModal.jsx` | Main editing surface — approval, status, all research fields |
| `Frontend/src/pages/DashboardPage.jsx` | Tab switching (Client/Agent), employee record cap logic |
