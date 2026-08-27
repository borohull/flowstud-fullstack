Full-stack home project - Phase 2

In the second phase of the assignment, each student must implement the application according to the accepted design plan.
The requirements are the same as in Phase 1, and they are listed below.
The home assignment will be accepted if it fulfills all the crierias in the requirements!
The solution has to contain a client and a server folder.
The client folder contains the React application, the server folder contains the Laravel API.
Students must submit the the application code and a README.md file in a compressed ZIP file.
The vendor and node_modules folders must be removed. The README file should contain a checklist about the fulfilled requirements, and it has to contain a link to a video.
Students has to upload the video to their university 0365 onedrive folder, and has to create a link to access the video.
The video should present the working application showing every implemented and expected features.
The length of the video cannot be longer than 10 minutes.
The video has to be available until the end of the semester.
The README.md file contains the video link, a statement of originality, and the requirements checklist.

## Project Requirements - Checklist

### Database Requirements
- [x] Use a relational database
- [x] At least 3 database tables with clear responsibilities
- [x] Meaningful relationships between tables using proper foreign keys
- [x] A users table (or equivalent authentication user persistence) as part of the model
- [x] At least one 1:N (one-to-many) relationship implemented and actively used

### Authentication & Authorization (Server-side + Client-side)
Authentication implemented using
- [x] Laravel Breeze
- [x] Laravel Sanctum (API tokens)
- [x] Logged-in users cannot access data owned by other users
- [x] This rule is enforced at the API level, not only via Ul hiding
- [x] Sensitive actions are protected by roles and/or permissions

### API (REST)
- [x] Full CRUD support for every core persisted resource exposed by the API
- [x] At least one persisted entity uses owner-scoped CRUD

### Client-side Pages / UI Quality
- [x] Polished, user-friendly interface
- [x] Responsive design
- [x] Desktop
- [x] Mobile
- [x] Use of a component library