## Node backend for a video sharing plateform (cloudTube)

cloudTube is a video sharing platform where users can upload, share, and view videos. This project is the backend for cloudTube, built with Node.js. It provides APIs for user authentication, video management, tweet management, and subscription management. Users can register, login, upload videos, create tweets, subscribe to channels, and more. The backend is hosted on Render and uses MongoDB for data storage.

## How to run the project locally

1. Clone this repo
2. Run `npm install`
3. Run `npm start`
4. Go to `http://localhost:8000`

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

### Comment Routes

- GET "/video-comments/:videoId" - To get comments of a video
- POST "/addComment/:commentId" - To add a comment
- PATCH "/updateComment/:commentId" - To update a comment by its ID
- DELETE "/deleteComment/:commentId" - To delete a comment by its ID

### Like Routes

- POST "/toggle-comment-like/:commentId" - To toggle like on a comment
- POST "/toggle-tweet-like/:tweetId" - To toggle like on a tweet
- POST "/toggle-video-like/:videoId" - To toggle like on a video
- GET "/liked-videos" - To get all videos a user has liked

### Playlist Routes

- POST "/createPlaylist" - To create a new playlist.
- GET "/getUserPlaylists" - To retrieve all playlists of a user.
- GET "/getPlaylistById/:playlistId" - To retrieve a specific playlist by its ID.
- POST "/addVideoToPlaylist/:playlistId/:videoId" - To add a video to a playlist.
- DELETE "/removeVideoFromPlaylist/:playlistId/:videoId" - To remove a video from a playlist.
- DELETE "/deletePlaylist/:playlistId" - To delete a specific playlist.
- PATCH "/updatePlaylist/:playlistId" - To update the details of a specific playlist.
