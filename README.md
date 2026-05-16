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
### Create OTP
**POST** `/functions/v1/create-send-OTP`
## Request
```json
{
  "email": "barabaraotp@gmail.com"
}
```
## Response
```json
{
    "success": true,
    "message": "OTP sent successfully",
    "otp_id": 16
}
```
###
---
### Verify OTP
**POST** `v1/create-otp-verification`
## Request  
```json
{
  "email": "barabaraotp@gmail.com",
  "code": "2713"
}

```
## Response
```json
{
    "valid": true,
    "message": "OTP verified successfully",
    "otp": {
        "id": 18,
        "email": "barabaraotp@gmail.com",
        "code": "2713",
        "status": "pending",
        "created_date": "2026-05-06",
        "created_time": "11:10:47"
    }
}

```
###
---
### Get country and related cities
**GET** `https://kddxhgggbhctkvrmhdgm.supabase.co/rest/v1/country?select=*,city(*)&city.status=eq.active`
## Response
```json

[
    {
        "id": 1,
        "created_at": "2026-05-06T20:05:17.326081+00:00",
        "name": "Democratic Republic of Congo",
        "country_code": "+243",
        "currency": "Franc",
        "status": "active",
        "flag": null,
        "tag": "DRC",
        "city": [
            {
                "id": 1,
                "name": "Kinshasha",
                "status": "active",
                "country_id": 1,
                "created_at": "2026-05-06T20:06:16.889501+00:00",
                "description": null
            }
        ]
    }
]


```

---

### Get all countries
**GET** `/rest/v1/country?select=*`
## Response
```json
[{}]
```
---
### Get terms for all users/ general terms
**GET** `/rest/v1/terms?select=*`
## Response
```json
[{}]
```
---
### Get terms for drivers and general users
**GET** `/rest/v1/terms?select=*&target_user=in.(driver,all)`
## Response
```json
[{}]
```
---
### Get terms for drivers only
**GET** `/rest/v1/terms?select=*&target_user=eq.driver`
## Response
```json
[{}]
```
---
### Get terms for passengers only
**GET** `/rest/v1/terms?select=*&target_user=eq.passenger`
## Response
```json
[ {} ]
```
---
### Get terms for passenger and general users
**GET** `/rest/v1/terms?select=*&target_user=in.(all,passenger)`
## Response
```json
[{}]
```
---
### Create driver
**POST** `/functions/v1/create-driver`
## Request
```json

{
  "email": "johndoe01@gmail.com",
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
},
"nextOfKin":{
"full_name": "Joseph Doe",     
"gender":"male",          
"relationship": "brother",
"phone_number":"078900000",
"email": "johndoe01@gmail.com",
"address": "Kampala",
"id_photo_url":null,
"is_emergency_contact":null
}
}


```
### Response
```json

{
    "success": true,
    "userAuthentication": {
        "email": "johndoe01@gmail.com",
        "name": "John",
        "telephone": "0752111111",
        "user_id": "bfee62dd-6908-4455-b9b4-0f34e74ff647"
    },
    "userBio": {
        "id": 31,
        "first_name": "John",
        "last_name": "Doe",
        "other_names": "",
        "gender": "male",
        "date_of_birth": null,
        "telephone": "0752111111",
        "email": "johndoe01@gmail.com",
        "profile_photo_url": "url",
        "city": "Kampala",
        "country": "DRC",
        "nationality": "DRC",
        "preferred_language": "ENG",
        "online_status": false,
        "last_seen_at": null,
        "role": "rider",
        "user_id": "bfee62dd-6908-4455-b9b4-0f34e74ff647"
    },
    "nextOfKin": {
        "id": 1,
        "created_at": "2026-05-07T06:33:49.396511+00:00",
        "user_id": 31,
        "full_name": "Joseph Doe",
        "gender": "male",
        "relationship": "brother",
        "phone_number": "078900000",
        "email": "johndoe01@gmail.com",
        "address": "Kampala",
        "id_photo_url": null,
        "is_emergency_contact": null,
        "created_by": null,
        "updated_by": null
    },
    "driverProfile": {
        "id": 16,
        "created_at": "2026-05-05T19:25:22.554219+00:00",
        "uuid": "37da7576-84a8-4631-a948-b0d6d91222ec",
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
        "created_by": "8bcd3d13-d826-434c-b301-b6dfa24fdd82",
        "user_id": 31
    }
}

```
---
### Logout user
**POST** `/auth/v1/logout`
## Request
```json
{ 

}

```
## Response
```json
{
"ok": true
}
```
---
### Get user profile
**Post** `/functions/v1/get-user-profile`
## Request 
```json
{
"user_id": "bfee62dd-6908-4455-b9b4-0f34e74ff647"
}
```
## Response
```json
{
    "id": 38,
    "first_name": "Musoke",
    "last_name": "Ben",
    "other_names": null,
    "gender": "male",
    "date_of_birth": "2008-05-01",
    "telephone": "+256777889663",
    "email": "driver@gmail.com",
    "profile_photo_url": ".....",
    "city": "Kinshasha",
    "country": "DR Congo",
    "nationality": "Uganda",
    "preferred_language": "en",
    "online_status": false,
    "last_seen_at": "2026-05-06",
    "role": "rider",
    "user_id": "0665becc-2c12-425c-af78-43b364c9e21a",
    "profile": {
        "id": 16,
        "created_at": "2026-05-05T19:25:22.554219+00:00",
        "uuid": "37da7576-84a8-4631-a948-b0d6d91222ec",
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
        "created_by": "8bcd3d13-d826-434c-b301-b6dfa24fdd82",
        "user_id": 38
    }
}
```
##
---
### Get user Bio data
**Get** `/rest/v1/user?user_id=eq.user_id` 
## Response
```json
[
    {
        "id": 31,
        "first_name": "John",
        "last_name": "Doe",
        "other_names": "",
        "gender": "male",
        "date_of_birth": null,
        "telephone": "0752111111",
        "email": "johndoe01@gmail.com",
        "profile_photo_url": "url",
        "city": "Kampala",
        "country": "DRC",
        "nationality": "DRC",
        "preferred_language": "ENG",
        "online_status": false,
        "last_seen_at": null,
        "role": "passenger",
        "user_id": "bfee62dd-6908-4455-b9b4-0f34e74ff647"
    }
]

```
---
### Update Bio Data
**Patch** `/rest/v1/user?id=eq.id`
## Request
```json
{
"other_names":"other names"
}

```
### Response
```json
[{}]
```
---
### Delete user bio data
**Delete** `/rest/v1/user?id=eq.id`
## Response
```json
[{}]
```
---
### Document Upload
**Post** `/functions/v1/upload-documents`
## Request
```json
{
"file":"......."
}
```
## Response
```json
{
    "success": true,
    "path": "documents/1778236744551-pm6h4p-Screenshot_2026-05-07_at_3.25.46_PM.png",
    "url": "https://kddxhgggbhctkvrmhdgm.supabase.co/storage/v1/object/public/documents/documents/1778236744551-pm6h4p-Screenshot_2026-05-07_at_3.25.46_PM.png"
}
```
----

### Add motor
**Post** `/rest/v1/motor`
## Request
```json
{
  "transport_type": "bike",
  "registration_number": "ABC-123",
  "make": "Yamaha",
  "model": "R1",
  "color": "Black",
  "manufacture_year": 2024,
  "number_of_passengers": 2,
  "police_letter_url": "https://example.com/police.pdf",
  "insurance_url": "https://example.com/insurance.pdf",
  "insurance_expiry_date": "2026-12-31",
  "registration_certificate_url": "https://example.com/registration.pdf",
  "road_worthiness_certificate_url": "https://example.com/roadworthy.pdf",
  "maintenance_record_url": "https://example.com/maintenance.pdf",
  "is_verified": false,
  "verified_at": null,
  "created_by": 31,
  "user_id": 31
}
```
## Response
```json
[]
```
---
### Get motor
**Get** `/rest/v1/motor?user_id=eq.user_id`
## Response
```json
[
    {
        "id": 2,
        "created_at": "2026-05-08T11:33:21.19358+00:00",
        "transport_type": "bike",
        "registration_number": "ABC-123",
        "make": "Yamaha",
        "model": "R1",
        "color": "Black",
        "manufacture_year": 2024,
        "number_of_passengers": 2,
        "police_letter_url": "https://example.com/police.pdf",
        "insurance_url": "https://example.com/insurance.pdf",
        "insurance_expiry_date": "2026-12-31",
        "registration_certificate_url": "https://example.com/registration.pdf",
        "road_worthiness_certificate_url": "https://example.com/roadworthy.pdf",
        "maintenance_record_url": "https://example.com/maintenance.pdf",
        "is_verified": false,
        "verified_at": null,
        "created_by": 31,
        "user_id": 31
    },
]
```
### Update motor
**Patch** `/rest/v1/motor?user_id=eq.user_id`
## Request
```json
{
"make" : "Suzuki"
}
```
## Response
```json
[]
```
---

### Delete motor
**Delete** `/rest/v1/motor?user_id=eq.user`
### Response
```json
[]
```
### Get user wallet
**Get** `/rest/v1/wallet?user_id=eq.user_id`
## Response
```json
[]
```
### Update user wallet
**Post** `/functions/v1/update-wallet`
## Request
``` Json
{
    "user_id" : 31,
    "amount" : 1000
}

```
## Response
```json
{
    "success": true,
    "message": "Wallet updated successfully",
    "data": {
        "id": 1,
        "created_at": "2026-05-12T16:14:00.701036+00:00",
        "user_id": 31,
        "wallet_type": null,
        "balance": 10000,
        "currency": null,
        "is_active": null,
        "last_transaction_at": null,
        "frozen_at": null,
        "frozen_reason": null,
        "created_by": null,
        "updated_by": null
    }
}

```
### Get user wallet and related transactions
**Get** `/rest/v1/wallet?user_id=eq.user_id&select=*,wallet_transaction(*)`
## Response
```json
[
    {
        "id": 1,
        "created_at": "2026-05-12T16:14:00.701036+00:00",
        "user_id": 31,
        "wallet_type": null,
        "balance": 10000,
        "currency": null,
        "is_active": null,
        "last_transaction_at": null,
        "frozen_at": null,
        "frozen_reason": null,
        "created_by": null,
        "updated_by": null,
        "wallet_transaction": []
    }
]
```


### Create ride cost estimate
**Post** `/functions/v1/ride-cost`
## Request
```json
{
  "distance": 12
}

```
### Response
```json
{
    "success": true,
    "data": {
        "distance": 12,
        "cost_per_kilometre": 5000,
        "start_cost": 3000,
        "total_cost": 63000
    }
}
```
---
### Passenger request ride
**Post** `/functions/v1/create-ride`
## Request
``` json
{
"number_of_seats":null,
"pet":true,
"coupon_code":null,
"request_type":"self",
"passenger_id": 31,
"motor_category":"standard",
"transport_type":"motorcycle",
"pickup_address": "munyonyo",
"pickup_latitude": 6.5244,
"pickup_longitude": 3.3792,
"destination_address": "kampala",
"destination_latitude": 6.4541,
"destination_longitude": 3.4060,
"distance_km":2,
"estimated_duration_minutes":30,
"waypoints": [
{ "lat": 6.50, "lng": 3.39 },
{ "lat": 6.47, "lng": 3.40 }
],
"payment_method": "card"
}
```
### Response
```json
{
    "success": true,
    "message": "Successfully",
    "count": 1,
    "drivers": [
        {
            "user_id": 38,
            "transport_type": "motorcycle",
            "motor_category": "standard",
            "current_address": "munyonyo",
            "is_available": "true"
        }
    ],

    "ride": {
        "id": 49,
        "created_at": "2026-05-14T07:10:59.863837+00:00",
        "passenger_id": 31,
        "driver_id": null,
        "coupon_id": null,
        "pickup_address": "munyonyo",
        "pickup_latitude": 6.5244,
        "pickup_longitude": 3.3792,
        "destination_address": "kampala",
        "destination_latitude": 6.4541,
        "destination_longitude": 3.406,
        "waypoints": [
            {
                "lat": 6.5,
                "lng": 3.39
            },
            {
                "lat": 6.47,
                "lng": 3.4
            }
        ],
        "distance_km": 2,
        "estimated_duration_minutes": 30,
        "actual_duration_minutes": null,
        "estimated_fare": 6000,
        "actual_fare": null,
        "surge_multiplier": null,
        "discount_amount": null,
        "payment_method": "card",
        "status": "pending",
        "cancellation_reason": null,
        "cancelled_by": null,
        "cancellation_fee": null,
        "requested_at": "2026-05-14T07:10:59.863837",
        "accepted_at": null,
        "arrived_at": null,
        "started_at": null,
        "completed_at": null,
        "cancelled_at": null,
        "motor_category": "standard",
        "transport_type": "motorcycle",
        "cost_of_start": 2000,
        "cost_of_km": 2000,
        "cost_of_delay": 1000,
        "request_type": "self"
    }
}

```

### Driver ride confirm 
**Post** `/functions/v1/confirm-ride`
## Request
```json
{
  "ride_id": 6,
  "passenger_id": 31,
  "driver_id": 38
}
### Response
```json 
{
    "success": true,
    "message": "Ride confirmed successfully",
    "data": {
        "ride": {
            "id": 6,
            "created_at": "2026-05-12T22:11:29.895284+00:00",
            "passenger_id": 31,
            "driver_id": 38,
            "coupon_id": null,
            "pickup_address": "123 Main St",
            "pickup_latitude": 6.5244,
            "pickup_longitude": 3.3792,
            "destination_address": "456 Market St",
            "destination_latitude": 6.4541,
            "destination_longitude": 3.406,
            "waypoints": [
                {
                    "lat": 6.5,
                    "lng": 3.39
                },
                {
                    "lat": 6.47,
                    "lng": 3.4
                }
            ],
            "distance_km": 1.5,
            "estimated_duration_minutes": 16,
            "actual_duration_minutes": null,
            "estimated_fare": 10500,
            "actual_fare": null,
            "surge_multiplier": null,
            "discount_amount": null,
            "payment_method": "card",
            "status": "confirmed",
            "cancellation_reason": null,
            "cancelled_by": null,
            "cancellation_fee": null,
            "requested_at": null,
            "accepted_at": null,
            "arrived_at": null,
            "started_at": null,
            "completed_at": null,
            "cancelled_at": null
        },
        "ride_code": {
            "id": 3,
            "created_at": "2026-05-12T22:11:52.704894+00:00",
            "passenger_id": 31,
            "driver_id": 38,
            "passenger_telephone": "0752111111",
            "driver_telephone": "+256777889663",
            "code": "6494",
            "ride_id": 6
        }
    }
}
```

### Get driver pending request
**GET** `rest/v1/ride_request?driver_id=eq.driver_id&status=eq.pending`
## Response
```json
[{}]
```

### Get all driver request
**GET** `/rest/v1/ride_request?driver_id=eq.driver_id`
## Response
```json
[{}]
```

### Get driver accepted request
**GET** `rest/v1/ride_request?driver_id=eq.driver_id&status=eq.accepted`
## Response
```json
[{}]
```

### Driver accepts ride request
**Post** `/functions/v1/driver-accepts-ride-request`
## Request
```json
{
"driver_id":38,
"id":54
}

```
## Response
```json
{
    "success": true,
    "confirmation_data": {
        "id": 8,
        "created_at": "2026-05-14T13:56:43.811906+00:00",
        "passenger_id": 31,
        "driver_id": 38,
        "passenger_telephone": "0752111111",
        "driver_telephone": "+256777889663",
        "code": "4599",
        "ride_id": 74,
        "driver_names": "Musoke Ben"
    }
}

```

### Get specific driver request details
**GET** `/rest/v1/ride_request?&id=eq.request_id&driver_id=eq.driver_id`
## Response
``` json
[{}]
```
---

### Ride cancellation
## Request
**Post** `/functions/v1/cancel-ride`
``` json
{
    "user_id":31,
    "ride_id":74,
    "reason":"delayed"
}

```
## Response
```json
{
    "success": true,
    "message": "Ride has been cancelled",
    "data": [
        {
            "id": 74,
            "created_at": "2026-05-14T10:56:50.502904+00:00",
            "passenger_id": 31,
            "driver_id": 38,
            "coupon_id": 1,
            "pickup_address": "munyonyo",
            "pickup_latitude": 6.5244,
            "pickup_longitude": 3.3792,
            "destination_address": "kampala",
            "destination_latitude": 6.4541,
            "destination_longitude": 3.406,
            "waypoints": [
                {
                    "lat": 6.5,
                    "lng": 3.39
                },
                {
                    "lat": 6.47,
                    "lng": 3.4
                }
            ],
            "distance_km": 2,
            "estimated_duration_minutes": 30,
            "actual_duration_minutes": null,
            "estimated_fare": 6000,
            "actual_fare": null,
            "surge_multiplier": null,
            "discount_amount": null,
            "payment_method": "card",
            "status": "cancelled",
            "cancellation_reason": "delayed",
            "cancelled_by": "passenger",
            "cancellation_fee": null,
            "requested_at": "2026-05-14T10:56:50.502904",
            "accepted_at": "2026-05-14T13:56:43.626",
            "arrived_at": null,
            "started_at": null,
            "completed_at": null,
            "cancelled_at": null,
            "motor_category": "standard",
            "transport_type": "motorcycle",
            "cost_of_start": 2000,
            "cost_of_km": 2000,
            "cost_of_delay": 1000,
            "request_type": "self",
            "discount": 50,
            "number_of_seats": 2,
            "pet": true
        }
    ]
}
```
---
### Get user notifications
**GET** `/rest/v1/notification?user_id=eq.user_id&order=created_at.desc`
## Response
```json
[]
```
---
### Driver starts a ride
**POST** ` /functions/v1/start-ride`
## Request
```json
{
"ride_id":93,
"passenger_id":31,
"code":6435
}

```
## Response
``` json
{
    "success": true,
    "message": "Ride started successfully",
    "data": [
        {
            "id": 93,
            "created_at": "2026-05-15T15:11:57.211171+00:00",
            "passenger_id": 31,
            "driver_id": 38,
            "coupon_id": 1,
            "pickup_address": "munyonyo",
            "pickup_latitude": 6.5244,
            "pickup_longitude": 3.3792,
            "destination_address": "kampala",
            "destination_latitude": 6.4541,
            "destination_longitude": 3.406,
            "waypoints": [
                {
                    "lat": 6.5,
                    "lng": 3.39
                },
                {
                    "lat": 6.47,
                    "lng": 3.4
                }
            ],
            "distance_km": 2,
            "estimated_duration_minutes": 30,
            "actual_duration_minutes": null,
            "estimated_fare": 6000,
            "actual_fare": null,
            "surge_multiplier": null,
            "discount_amount": 0,
            "payment_method": "card",
            "status": "started",
            "cancellation_reason": null,
            "cancelled_by": null,
            "cancellation_fee": null,
            "requested_at": "2026-05-15T15:11:57.211171",
            "accepted_at": "2026-05-15T15:47:47.402",
            "arrived_at": null,
            "started_at": "2026-05-15T16:00:15.849",
            "completed_at": null,
            "cancelled_at": null,
            "motor_category": "standard",
            "transport_type": "motorcycle",
            "cost_of_start": 2000,
            "cost_of_km": 2000,
            "cost_of_delay": 1000,
            "request_type": "self",
            "discount": 50,
            "number_of_seats": null,
            "pet": true,
            "ride_code": "6435"
        }
    ]
}

```
----

### Passenger search for a ride
**POST** `/functions/v1/search-ride`
## Request
```json

{
    "pickup":"munyonyo",
    "dropoff":"kampala",
    "distance":4.2
}


```
## Response
```json
{
    "success": true,
    "data": [
        {
            "category": "basic",
            "drivers_available": 1,
            "pickup": "munyonyo",
            "dropoff": "kampala",
            "cost": {
                "min": 16800,
                "max": 50400
            }
        },
        {
            "category": "family",
            "drivers_available": 1,
            "pickup": "munyonyo",
            "dropoff": "kampala",
            "cost": {
                "min": 12600,
                "max": 63000
            }
        }
    ]
}
```

### Passenger request ride
**POST** `/functions/v1/passenger-request-ride`
## Request 
```json
{
"category":"basic",
"pet":true,
"coupon_code":1,
"request_type":"self",
"passenger_id": 31,
"pickup_address": "munyonyo",
"pickup_latitude": 6.5244,
"pickup_longitude": 3.3792,
"destination_address": "kampala",
"destination_latitude": 6.4541,
"destination_longitude": 3.4060,
"distance_km":5,
"estimated_duration_minutes":30,
"waypoints": [
{ "lat": 6.50, "lng": 3.39 },
{ "lat": 6.47, "lng": 3.40 }
],
"payment_method": "card"
}

```
## Response
```json
{
    "success": true,
    "message": "Successfully",
    "data": {
        "id": 120,
        "created_at": "2026-05-16T18:01:03.024422+00:00",
        "passenger_id": 31,
        "driver_id": null,
        "coupon_id": 1,
        "pickup_address": "munyonyo",
        "pickup_latitude": 6.5244,
        "pickup_longitude": 3.3792,
        "destination_address": "kampala",
        "destination_latitude": 6.4541,
        "destination_longitude": 3.406,
        "waypoints": [
            {
                "lat": 6.5,
                "lng": 3.39
            },
            {
                "lat": 6.47,
                "lng": 3.4
            }
        ],
        "distance_km": 5,
        "estimated_duration_minutes": 30,
        "actual_duration_minutes": null,
        "estimated_fare": 20000,
        "actual_fare": null,
        "surge_multiplier": null,
        "discount_amount": 0,
        "payment_method": "card",
        "status": "pending",
        "cancellation_reason": null,
        "cancelled_by": null,
        "cancellation_fee": null,
        "requested_at": "2026-05-16T18:01:03.024422",
        "accepted_at": null,
        "arrived_at": null,
        "started_at": null,
        "completed_at": null,
        "cancelled_at": null,
        "motor_category": null,
        "transport_type": "motorcycle",
        "cost_of_start": null,
        "cost_of_km": null,
        "cost_of_delay": null,
        "request_type": "self",
        "discount": 50,
        "number_of_seats": null,
        "pet": true,
        "ride_code": "1",
        "service_category": "basic"
    }
}
```
---





