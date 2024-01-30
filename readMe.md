## Node backend for a video sharing plateform (cloudTube)

cloudTube is a video sharing platform where users can upload, share, and view videos. This project is the backend for cloudTube, built with Node.js. It provides APIs for user authentication, video management, tweet management, and subscription management. Users can register, login, upload videos, create tweets, subscribe to channels, and more. The backend is hosted on Render and uses MongoDB for data storage.

## How to run the project locally

1. Clone this repo
2. Run `npm install`
3. Run `npm start`
4. Go to `http://localhost:8000`

## additionally Server is hosted on render at https://nodebackend-cloudtube.onrender.com/

## API endpoints

### User Routes

- POST "api/v1/users/login" - To login a user
- POST "/api/v1/users/refresh-token" - To refresh the access token
- POST "/api/v1/users/reset-password" - To request a password reset
- POST "/api/v1/users/reset-password-verify" - To verify and update the forgotten password

#### Secured Routes

- POST "/api/v1/users/logout" - To logout a user
- POST "/api/v1/users/change-password" - To change the current password
- GET "/api/v1/users/user-data" - To get the user profile data
- PATCH "/api/v1/users/update-profile" - To update account details
- PATCH "/api/v1/users/update-avatar" - To update the user's avatar
- PATCH "/api/v1/users/update-cover-image" - To update the user's cover image
- GET "/api/v1/users/user-channel-details/:username" - To get the user's channel profile
- GET "/api/v1/users/get-watch-history" - To get the user's watch history

### Video Routes

- GET "/api/v1/videos/get-all-videos" - To get all videos
- POST "/api/v1/videos/publish-video" - To publish a new video
- GET "/api/v1/videos/get-video-by-id/:videoId" - To get a video by its ID
- PATCH "/api/v1/videos/update-video/:videoId" - To update a video by its ID
- DELETE "/api/v1/videos/delete-video/:videoId" - To delete a video by its ID

### Tweet Routes

- POST "/api/v1/tweets/add-tweet" - To create a new tweet
- GET "/api/v1/tweets/get-all-tweets" - To get all tweets of a user
- PATCH "/api/v1/tweets/update-tweet/:id" - To update a tweet by its ID
- DELETE "/api/v1/tweets/delete-tweet/:id" - To delete a tweet by its ID

### Subscription Routes

- GET "/api/v1/subscribtion/toggle-subscription/:channelId" - To toggle subscription to a channel
- GET "/api/v1/subscribtion/get-user-channel-subscribers/:channelId" - To get subscribers of a user's channel
- GET "/api/v1/subscribtion/get-subscribed-channels" - To get channels a user is subscribed to
