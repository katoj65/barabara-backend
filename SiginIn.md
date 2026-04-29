#Barabara App Backend API
## Authentication: User Login
Logs in users

**Endpoint:** `POST  https://kddxhgggbhctkvrmhdgm.supabase.co/auth/v1/token?grant_type=password
### Headers
| Key | Value |
| :--- | :--- |
| Content-Type | `application/json` |
| apikey | `[YOUR-ANON-KEY]` |
| Authorization | `Bearer [YOUR-ANON-KEY]` |

### Request Body
```json
{
  "email": "user@gmail.com",
  "password": "secure-password",
}


### Response
{
  "access_token": "eyJhbG...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": { "id": "uuid", "email": "driver@example.com" }
}

