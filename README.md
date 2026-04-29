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
  "email": "user@gmail.com",
  "password": "secure-password",
  "data": {
    "first_name": "John",
    "last_name":"Doe",
    "other_names":"",
    "gender":"male",
    "dob":"DD,MM,YY",
    "telephone":"0752111111",
    "profile_photo":"url",
    "country":"DRC",
    "nationality":"DRC",
    "role": "rider",
    "photo_url":"",
    "city":"Kampala",
    "preferred_language":"ENG",
    "online_status":"active",
     "last_seen_at":""
   
  }
}


### Response 
{
    "id": "13b04dec-af72-41d6-812b-29cb70926f31",
    "aud": "authenticated",
    "role": "",
    "email": "user@gmail.com",
    "phone": "",
    "confirmation_sent_at": "2026-04-29T06:16:09.767777662Z",
    "app_metadata": {
        "provider": "email",
        "providers": [
            "email"
        ]
    },
    "user_metadata": {
        "city": "Kampala",
        "country": "DRC",
        "dob": "DD,MM,YY",
        "first_name": "John",
        "gender": "male",
        "last_name": "Doe",
        "last_seen_at": "",
        "nationality": "DRC",
        "online_status": "active",
        "other_names": "",
        "photo_url": "",
        "preferred_language": "ENG",
        "profile_photo": "url",
        "role": "rider",
        "telephone": "0752111111"
    },
    "identities": [],
    "created_at": "2026-04-29T06:16:09.767777662Z",
    "updated_at": "2026-04-29T06:16:09.767777662Z",
    "is_anonymous": false
}














#User Login
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

