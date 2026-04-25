#Barabara App Backend API
## Authentication: User SignUp
Registers a new user 

**Endpoint:** `POST https://kddxhgggbhctkvrmhdgm.supabase.co/auth/v1/signup
### Headers
| Key | Value |
| :--- | :--- |
| Content-Type | `application/json` |
| apikey | `[YOUR-ANON-KEY]` |
| Authorization | `Bearer [YOUR-ANON-KEY]` |

### Request Body
```json
{
  "email": "user@example.com",
  "password": "secure-password",
  "data": {
    "first_name": "John",
    "last_name":"Doe",
    "gender":"male",
    "dob":"DD,MM,YY",
    "telephone":"0752111111",
    "profile_photo":"url",
    "country":"DRC",
    "nationality":"DRC",
    "language":"ENG",
    "status":"active",
    "role": "rider"
  }
}

### Response
Upon a successful signup, the API returns a JSON object containing:
User Data: A unique user ID and the metadata you provided.
JWT (JSON Web Token): An access token that you must capture and store on the client side.

