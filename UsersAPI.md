## Users API
Registers a new user 
### Headers
| Key | Value |
| :--- | :--- |
| Content-Type | `application/json` |
| apikey | `[API_KEY]` |
| Authorization | `Bearer [YOUR-ACCESS-TOKEN]` |

Create User
**Endpoint:** POST https://kddxhgggbhctkvrmhdgm.supabase.co/rest/v1/users
### Request Body
```json
{
"first_name": "John",
"last_name":"Doe",
"other_names":"",
"gender":"male",
"":"DD,MM,YY",
"email":"user@gmail.com",
"telephone":"0752111111",
"country":"DRC",
"nationality":"DRC",
"role": "rider",
"profile_photo_url":"",
"city":"Kampala",
"preferred_language":"ENG",
"online_status":"active",
"last_seen_at":""
}

## Response


##Get all users
**Endpoint:** GET https://kddxhgggbhctkvrmhdgm.supabase.co/rest/v1/users?select=*

##Get 