# Barabara App Backend API

### Headers for Unauthenticated user
| Key | Value |
| :-- | :-- |
| Content-Type | `application/json` |
| apikey | `[API-KEY]` |
| Authorization | `Bearer [YOUR-ANON-KEY]` |


## base url
https://kddxhgggbhctkvrmhdgm.supabase.co


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



## Authenticated users
## Headers for Authenticated user
| Key | Value |
| :-- | :-- |
| Content-Type | `application/json` |
| apikey | `[API-KEY]` |
| Authorization | `Bearer[YOUR-ACCESS-TOKEN]` |



### create user profile
**POST** `/rest/v1/users`
## Request
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

### Get all users
**GET** `/rest/v1/users?select=*`
## Response
```json
[
    {
        "id": 8,
        "first_name": "John",
        "last_name": "Doe",
        "other_names": "the name goes here",
        "gender": "male",
        "date_of_birth": "1995-05-15",
        "telephone": "0752111111",
        "email": "email2@gmail.com",
        "profile_photo_url": null,
        "city": "Kampala",
        "country": "DRC",
        "nationality": "DRC",
        "preferred_language": "ENG",
        "online_status": true,
        "last_seen_at": null,
        "role": "rider",
        "user_id": "dd7bb914-401b-42be-8044-25479a21dd7a"
    },
    {
        "id": 9,
        "first_name": "John",
        "last_name": "Doe",
        "other_names": "the name goes here",
        "gender": "male",
        "date_of_birth": "1995-05-15",
        "telephone": "0752111111",
        "email": "email@gmail.com",
        "profile_photo_url": null,
        "city": "Kampala",
        "country": "DRC",
        "nationality": "DRC",
        "preferred_language": "ENG",
        "online_status": true,
        "last_seen_at": null,
        "role": "rider",
        "user_id": "dd7bb914-401b-42be-8044-25479a21dd7a"
    },
    {
        "id": 11,
        "first_name": "John1",
        "last_name": "Doe1",
        "other_names": null,
        "gender": "male",
        "date_of_birth": "1995-05-15",
        "telephone": "0752111111",
        "email": "katoj30@gmail.com",
        "profile_photo_url": null,
        "city": "Kampala",
        "country": "DRC",
        "nationality": "DRC",
        "preferred_language": "ENG",
        "online_status": true,
        "last_seen_at": null,
        "role": "rider",
        "user_id": "dd7bb914-401b-42be-8044-25479a21dd7a"
    }
]
```

### Get user profile by user_id
**Get** `/rest/v1/users?user_id=eq.uuid`
## Response
```json

[
    {
        "id": 8,
        "first_name": "John",
        "last_name": "Doe",
        "other_names": "...",
        "gender": "male",
        "date_of_birth": "1995-05-15",
        "telephone": "0752111111",
        "email": "email@gmail.com",
        "profile_photo_url": null,
        "city": "Kampala",
        "country": "DRC",
        "nationality": "DRC",
        "preferred_language": "ENG",
        "online_status": true,
        "last_seen_at": null,
        "role": "rider",
        "user_id": "......."
    }
]
  


```

### Update user profile
**PUT** `/rest/v1/users?user_id=eq.uuid`
## Request
```json
{ 
"other_names": "other name"
}

```

### Delete user profile
**DELETE** `/rest/v1/users?user_id=eq.uuid`
## Request
---

### Create Rider Profile (table rider)
**POST** `/rest/v1/rider`
## Request
```json

{
  "uuid": "......",
  "transport_type": "car",
  "motor_category": "SUV",
  "license_number": "UBJ 998J",
  "rating": 2,
  "total_rides": 0,
  "total_earnings": 0,
  "total_commission_paid": 0,
  "total_penalty_paid": 0,
  "is_approved": false,
  "approved_by": null,
  "current_ride": 0,
  "current_location_latitude": 0,
  "current_location_longitude": 0,
  "last_location_update": null,
  "created_by": null,
  "user_id": 11
}

```
### Get all riders
**GET** `/rest/v1/rider?select=*`
## Response
```json

[
    {
        "id": 2,
        "created_at": "2026-05-04T06:40:06.39825+00:00",
        "uuid": ".....",
        "transport_type": "car",
        "motor_category": "SUV",
        "license_number": "UBJ 998J",
        "rating": 2,
        "total_rides": 0,
        "total_earnings": 0,
        "total_commission_paid": 0,
        "total_penalty_paid": 0,
        "is_approved": false,
        "approved_by": null,
        "current_ride": 0,
        "current_location_latitude": 0,
        "current_location_longitude": 0,
        "last_location_update": null,
        "created_by": null,
        "user_id": 11
    }
]

```
### Get rider by user_id
**GET** `/rest/v1/rider?user_id=eq.uuid`
## Response
```json
[

{
        "id": 2,
        "created_at": "2026-05-04T06:40:06.39825+00:00",
        "uuid": ".....",
        "transport_type": "car",
        "motor_category": "SUV",
        "license_number": "UBJ 998J",
        "rating": 2,
        "total_rides": 0,
        "total_earnings": 0,
        "total_commission_paid": 0,
        "total_penalty_paid": 0,
        "is_approved": false,
        "approved_by": null,
        "current_ride": 0,
        "current_location_latitude": 0,
        "current_location_longitude": 0,
        "last_location_update": null,
        "created_by": null,
        "user_id": 11
    }    

]
```
### Update rider profile

**PATCH** `/rest/v1/rider?user_id=eq.uuid`
## Request
```json

{ "transport_type": "motorcycle" }

```

### Delete rider profile
**DELETE** `/rest/v1/rider?user_id=eq.uuid`
## Request
---

### Create Motor Owner
## Request
**POST** `/rest/v1/motor_owner`
```json

{
  
"user_id":11,
"full_name": "John Doe",
"address": "123 Market Street, Apt 4B, Springfield",
"telephone": "+15551234567",
"email": "john.doe@example.com",
"country": "US",
"nationality": "Ugandan",
"id_front_url": "https://example-bucket.supabase.co/storage/v1/object/public/ids/id-front-001.jpg",
"id_back_url": "https://example-bucket.supabase.co/storage/v1/object/public/ids/id-back-001.jpg",
"id_number":"A123456789",
"agreement_document_url": "https://example-bucket.supabase.co/storage/v1/object/public/docs/lease-agreement-001.pdf",
"contract_start_date": "2026-01-15",
"contract_end_date": "2027-01-14",
"created_by": "system",
"updated_by": "system"
}

```
### Get all motor owners
**GET** `/rest/v1/motor_owner?select=*`
## Response
```json
[
    {
        "id": 2,
        "created_at": "2026-05-04T08:11:56.142677+00:00",
        "user_id": 11,
        "full_name": "John Doe",
        "address": "123 Market Street, Apt 4B, Springfield",
        "telephone": "+15551234567",
        "email": "john.doe@example.com",
        "country": "US",
        "nationality": "American",
        "id_front_url": "https://example-bucket.supabase.co/storage/v1/object/public/ids/id-front-001.jpg",
        "id_back_url": "https://example-bucket.supabase.co/storage/v1/object/public/ids/id-back-001.jpg",
        "id_number": "A123456789",
        "agreement_document_url": "https://example-bucket.supabase.co/storage/v1/object/public/docs/lease-agreement-001.pdf",
        "contract_start_date": "2026-01-15",
        "contract_end_date": "2027-01-14",
        "created_by": "system",
        "updated_by": "system"
    }
]
```
### Get motor owner by user_id
**GET** `/rest/v1/motor_owner?user_id=eq.id`
## Response
```json
[
    {
        "id": 2,
        "created_at": "2026-05-04T08:11:56.142677+00:00",
        "user_id": 11,
        "full_name": "John Doe",
        "address": "123 Market Street, Apt 4B, Springfield",
        "telephone": "+15551234567",
        "email": "john.doe@example.com",
        "country": "US",
        "nationality": "American",
        "id_front_url": "https://example-bucket.supabase.co/storage/v1/object/public/ids/id-front-001.jpg",
        "id_back_url": "https://example-bucket.supabase.co/storage/v1/object/public/ids/id-back-001.jpg",
        "id_number": "A123456789",
        "agreement_document_url": "https://example-bucket.supabase.co/storage/v1/object/public/docs/lease-agreement-001.pdf",
        "contract_start_date": "2026-01-15",
        "contract_end_date": "2027-01-14",
        "created_by": "system",
        "updated_by": "system"
    }
]



```
### Update motor owner
**PATCH** `/rest/v1/motor_owner?user_id=eq.id`
## Request
```json
{
"full_name": "John kato"
}

```
### Delete motor owner
**DELETE** `/rest/v1/motor_owner?user_id=eq.id`
##
---

### Create new Driver/ Rider
**POST** `/functions/v1/create-user`
## Request
```json
{
  "email": "johndoe04@gmail.com",
  "password": "secure-password",
  "data": {
    "first_name": "John",
    "last_name":"Doe",
    "other_names":"",
    "gender":"male",
    "date_of_birth":null,
    "telephone":"0752111111",
    "profile_photo_url":"url",
    "country":"DRC",
    "nationality":"DRC",
    "role": "rider",
    "city":"Kampala",
    "preferred_language":"ENG",
    "online_status":false,
     "last_seen_at":null
  },

"riderProfile":{
"transport_type": "motorcycle",
"motor_category": "standard",
"license_number": "LIC-123456", 
"rating": 4.7,
"total_rides": 0,
"total_earnings": 0,
"total_commission_paid": 0,
"total_penalty_paid": 0,
"is_approved": false,
"approved_by": null,
"current_ride": null,
"current_location_latitude": 6.5244,
"current_location_longitude": 3.3792,
"last_location_update": "2026-05-05"
}
}

```
### Response

```json
{
    "success": true,
    "userAuthentication": {
        "email": "johndoe04@gmail.com",
        "name": "John",
        "telephone": "0752111111",
        "user_id": "63c3d0f3-0b68-463b-a45b-67686cecc2e2"
    },
    "userBio": {
        "id": 24,
        "first_name": "John",
        "last_name": "Doe",
        "other_names": "",
        "gender": "male",
        "date_of_birth": null,
        "telephone": "0752111111",
        "email": "johndoe04@gmail.com",
        "profile_photo_url": "url",
        "city": "Kampala",
        "country": "DRC",
        "nationality": "DRC",
        "preferred_language": "ENG",
        "online_status": false,
        "last_seen_at": null,
        "role": "rider",
        "user_id": "63c3d0f3-0b68-463b-a45b-67686cecc2e2"
    },
    "profile": {
        "id": 12,
        "created_at": "2026-05-05T08:01:55.632136+00:00",
        "uuid": "1b0adadf-cece-4493-881d-d49acef7994d",
        "transport_type": "motorcycle",
        "motor_category": "standard",
        "license_number": "LIC-123456",
        "rating": 4.7,
        "total_rides": 0,
        "total_earnings": 0,
        "total_commission_paid": 0,
        "total_penalty_paid": 0,
        "is_approved": false,
        "approved_by": null,
        "current_ride": null,
        "current_location_latitude": 6.5244,
        "current_location_longitude": 3.3792,
        "last_location_update": "2026-05-05T00:00:00",
        "created_by": "32974348-d768-4a08-ab74-49e01bd81580",
        "user_id": 24
    }
}


```
---
### Create new Passenger
**POST** `/functions/v1/create-passenger`
## Request
```json

{
  "email": "passenger@gmail.com",
  "password": "secure-password",
  "data": {
    "first_name": "John",
    "last_name":"Doe",
    "other_names":"",
    "gender":"male",
    "date_of_birth":null,
    "telephone":"0752111111",
    "profile_photo_url":"url",
    "country":"DRC",
    "nationality":"DRC",
    "role": "rider",
    "city":"Kampala",
    "preferred_language":"ENG",
    "online_status":false,
     "last_seen_at":null
  },

"passengerProfile":{
"total_rides": 0,
"total_expense": 0,
"referral_code": "ABC123",
"referred_by": null,
"average_rating": 4.5,
"is_premium": false,
"premium_expires_at": null
}
}


```
## Response

```json
{
    "success": true,
    "userAuthentication": {
        "email": "passenger@gmail.com",
        "name": "John",
        "telephone": "0752111111",
        "user_id": "db2c1f7f-dc86-4426-b622-363f9990396e"
    },
    "userBio": {
        "id": 25,
        "first_name": "John",
        "last_name": "Doe",
        "other_names": "",
        "gender": "male",
        "date_of_birth": null,
        "telephone": "0752111111",
        "email": "passenger@gmail.com",
        "profile_photo_url": "url",
        "city": "Kampala",
        "country": "DRC",
        "nationality": "DRC",
        "preferred_language": "ENG",
        "online_status": false,
        "last_seen_at": null,
        "role": "rider",
        "user_id": "db2c1f7f-dc86-4426-b622-363f9990396e"
    },
    "passengerProfile": {
        "id": 1,
        "created_at": "2026-05-05T09:20:23.768773+00:00",
        "user_id": 25,
        "total_rides": 0,
        "total_expense": 0,
        "referral_code": "ABC123",
        "referred_by": null,
        "average_rating": 4.5,
        "is_premium": false,
        "premium_expires_at": null,
        "created_by": "88e1e207-b2ac-45f6-a80c-504b395a45c7"
    }
}


```
---







    