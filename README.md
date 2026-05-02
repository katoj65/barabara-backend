# Barabara App Backend API

## Base URL
### Headers
| Key | Value |
| :--- | :--- |
| Content-Type | `application/json` |
| apikey | `[API-KEY]` |
| Authorization | `Bearer [YOUR-ANON-KEY]` |

## base url
https://kddxhgggbhctkvrmhdgm.supabase.co

---

## Register
**POST** `/auth/v1/signup`

### Request

```json
{
  "email": "email@gmail.com",
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

```
### Response
```json

{
    "id": "87b7cc49-e665-4d30-a36d-c2e45cba4500",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "katoj60@gmail.com",
    "phone": "",
    "confirmation_sent_at": "2026-05-02T12:41:38.757794191Z",
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
        "email": "email@gmail.com",
        "email_verified": false,
        "first_name": "John",
        "gender": "male",
        "last_name": "Doe",
        "last_seen_at": "",
        "nationality": "DRC",
        "online_status": "active",
        "other_names": "",
        "phone_verified": false,
        "photo_url": "",
        "preferred_language": "ENG",
        "profile_photo": "url",
        "role": "rider",
        "sub": "......",
        "telephone": "0752111111"
    },
    "identities": [
        {
            "identity_id": ".......",
            "id": ".......",
            "user_id": ".......",
            "identity_data": {
                "city": "Kampala",
                "country": "DRC",
                "dob": "DD,MM,YY",
                "email": "email@gmail.com",
                "email_verified": false,
                "first_name": "John",
                "gender": "male",
                "last_name": "Doe",
                "last_seen_at": "",
                "nationality": "DRC",
                "online_status": "active",
                "other_names": "",
                "phone_verified": false,
                "photo_url": "",
                "preferred_language": "ENG",
                "profile_photo": "url",
                "role": "rider",
                "sub": ".......",
                "telephone": "0752111111"
            },
            "provider": "email",
            "last_sign_in_at": "2026-05-02T12:41:38.75234125Z",
            "created_at": "2026-05-02T12:41:38.752389Z",
            "updated_at": "2026-05-02T12:41:38.752389Z",
            "email": "email@gmail.com"
        }
    ],
    "created_at": "2026-05-02T12:41:38.736067Z",
    "updated_at": "2026-05-02T12:41:39.320468Z",
    "is_anonymous": false
}

```

---

## Login

**POST** `/auth/v1/token?grant_type=password`

### Request

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

### Response

```json

    {"access_token": ".......",
    "token_type": "bearer",
    "expires_in": 3600,
    "expires_at": 1777729413,
    "refresh_token": "......",
    "user": {
        "id": ".........",
        "aud": "authenticated",
        "role": "authenticated",
        "email": "email@gmail.com",
        "email_confirmed_at": "2026-04-29T06:03:49.115933Z",
        "phone": "",
        "confirmation_sent_at": "2026-04-29T05:58:39.942849Z",
        "confirmed_at": "2026-04-29T06:03:49.115933Z",
        "last_sign_in_at": "2026-05-02T12:43:33.657122857Z",
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
            "email": "email@gmail.com",
            "email_verified": true,
            "first_name": "John",
            "gender": "male",
            "last_name": "Doe",
            "last_seen_at": "",
            "nationality": "DRC",
            "online_status": "active",
            "other_names": "",
            "phone_verified": false,
            "photo_url": "",
            "preferred_language": "ENG",
            "profile_photo": "url",
            "role": "rider",
            "sub": ".......",
            "telephone": "0752111111"
        },
        "identities": [
            {
                "identity_id": "........",
                "id": "........",
                "user_id": ".........",
                "identity_data": {
                    "city": "Kampala",
                    "country": "DRC",
                    "dob": "DD,MM,YY",
                    "email": "email@gmail.com",
                    "email_verified": true,
                    "first_name": "John",
                    "gender": "male",
                    "last_name": "Doe",
                    "last_seen_at": "",
                    "nationality": "DRC",
                    "online_status": "active",
                    "other_names": "",
                    "phone_verified": false,
                    "photo_url": "",
                    "preferred_language": "ENG",
                    "profile_photo": "url",
                    "role": "rider",
                    "sub": ".....",
                    "telephone": "0752111111"
                },
                "provider": "email",
                "last_sign_in_at": "2026-04-29T05:58:39.935953Z",
                "created_at": "2026-04-29T05:58:39.936008Z",
                "updated_at": "2026-04-29T05:58:39.936008Z",
                "email": "email@gmail.com"
            }
        ],
        "created_at": "2026-04-29T05:58:39.919946Z",
        "updated_at": "2026-05-02T12:43:33.672854Z",
        "is_anonymous": false
    },
    "weak_password": null
}
```

---


## create user profile
***POST** `/rest/v1/users`
### Request
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

```
---

