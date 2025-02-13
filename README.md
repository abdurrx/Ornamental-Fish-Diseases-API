# API Documentation for '/users'

## Base URL

All endpoints can be accessed via the following base URLs:

```
https://ofdd-api-j3n3oggtya-et.a.run.app
```

## Endpoint

### 1. **Register User**

- **URL**

  ```
  /users/register
  ```

- **Method**

  ```
  POST
  ```

- **Request Body**

  ```
  name: [string],
  email: [string],
  password: [string],
  confirmPassword: [string]
  ```

- **Response**
  ```json
  {
    "error": false,
    "message": "Successfully create user!",
    "registerResult": {
      "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "email": "xxx@gmail.com",
      "name": "Unknown"
    }
  }
  ```

### 2. **Login User**

- **URL**

  ```
  /users/login
  ```

- **Method**

  ```
  POST
  ```

- **Request Body**

  ```
  email: [string],
  password: [string]
  ```

- **Response**
  ```json
  {
    "error": false,
    "message": "Successfully login!",
    "loginResult": {
      "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "email": "xxx@gmail.com",
      "name": "Unknown",
      "token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    }
  }
  ```

### 3. **Profile User**

- **URL**

  ```
  /users/profile/:id
  ```

- **Method**

  ```
  GET
  ```

- **Headers**

  ```
  Authorization: Bearer <token>
  ```

- **URL Parameters**

  ```
  id: [string]
  ```

- **Response**
  ```json
  {
    "error": false,
    "message": "Successfully get user!",
    "profileResult": {
      "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "name": "Unknown",
      "email": "xxx@gmail.com"
    }
  }
  ```

### 4. **Update User**

- **URL**

  ```
  /users/update/:id
  ```

- **Method**

  ```
  PUT
  ```

- **Headers**

  ```
  Authorization: Bearer <token>
  ```

- **URL Parameters**

  ```
  id: [string]
  ```

- **Request Body**

  ```
  name: [string]
  ```

- **Response**
  ```json
  {
    "error": false,
    "message": "Successfully update user!",
    "updateResult": {
      "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "name": "Unknown",
      "email": "xxx@gmail.com"
    }
  }
  ```

### 5. **Change Password**

- **URL**

  ```
  /users/change-password/:id
  ```

- **Method**

  ```
  PUT
  ```

- **Headers**

  ```
  Authorization: Bearer <token>
  ```

- **URL Parameters**

  ```
  id: [string]
  ```

- **Request Body**

  ```
  oldPassword: [string],
  newPassword: [string],
  confirmPassword: [string]
  ```

- **Response**
  ```json
  {
    "error": false,
    "message": "Successfully change password!"
  }
  ```

### 6. **Send Reset Password**

- **URL**

  ```
  /users/send-reset-password
  ```

- **Method**

  ```
  POST
  ```

- **Request Body**

  ```
  email: [string]
  ```

- **Response**
  ```json
  {
    "error": false,
    "message": "Successfully send code!"
  }
  ```

### 7. **Reset Password**

- **URL**

  ```
  /users/reset-password
  ```

- **Method**

  ```
  PUT
  ```

- **Request Body**

  ```
  email: [string],
  code: [number],
  Password: [string],
  confirmPassword: [string]
  ```

- **Response**
  ```json
  {
    "error": false,
    "message": "Successfully reset password!"
  }
  ```

### 8. **Refresh Token**

- **URL**

  ```
  /users/refresh-token/:id
  ```

- **Method**

  ```
  GET
  ```

- **URL Parameters**

  ```
  id: [string]
  ```

- **Response**
  ```json
  {
    "error": false,
    "message": "Token refreshed!",
    "token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  }
  ```

### 9. **Logout User**

- **URL**

  ```
  /users/logout/:id
  ```

- **Method**

  ```
  GET
  ```

- **Headers**

  ```
  Authorization: Bearer <token>
  ```

- **URL Parameters**

  ```
  id: [string]
  ```

- **Response**
  ```json
  {
    "error": false,
    "message": "Successfully logout!"
  }
  ```

# API Documentation for '/articles'

## Base URL

All endpoints can be accessed via the following base URLs:

```
https://ofdd-api-j3n3oggtya-et.a.run.app
```

## Endpoint

### 1. **All Article**

- **URL**

  ```
  /articles
  ```

- **Method**

  ```
  GET
  ```

- **Response**
  ```json
  {
    "error": false,
    "message": "Successfully get articles!",
    "articleResults": [
      {
        "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "title": "xxxx",
        "content": "xxxx xxxx xxxx xxxx",
        "author": "xx",
        "image": "https://storage.googleapis.com/xxx.appspot.com/articles/xxx.png-xxxxxxxxxxxxx",
        "date": "2024-01-01"
      },
      ...
    ]
  }
  ```

### 2. **Detail Article**

- **URL**

  ```
  /articles/detail/:id
  ```

- **Method**

  ```
  GET
  ```

- **URL Parameters**

  ```
  id: [string]
  ```

- **Response**
  ```json
  {
    "error": false,
    "message": "Successfully get article!",
    "articleResult": {
      "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "title": "xxxx",
      "content": "xxxx xxxx xxxx xxxx",
      "author": "xx",
      "image": "https://storage.googleapis.com/xxx.appspot.com/articles/xxx.png-xxxxxxxxxxxxx",
      "date": "2024-01-01"
    }
  }
  ```

### 3. **Search Article**

- **URL**

  ```
  /articles/search/:title
  ```

- **Method**

  ```
  GET
  ```

- **URL Parameters**

  ```
  title: [string]
  ```

- **Response**
  ```json
  {
    "error": false,
    "message": "Successfully get articles!",
    "articleResults": [
      {
        "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "title": "xxxx",
        "content": "xxxx xxxx xxxx xxxx",
        "author": "xx",
        "image": "https://storage.googleapis.com/xxx.appspot.com/articles/xxx.png-xxxxxxxxxxxxx",
        "date": "2024-01-01"
      },
      ...
    ]
  }
  ```

# API Documentation for '/detections'

## Base URL

All endpoints can be accessed via the following base URLs:

```
https://ofdd-api-j3n3oggtya-et.a.run.app
```

## Endpoint

### 1. **Create Detection**

- **URL**

  ```
  /detections/create
  ```

- **Method**

  ```
  POST
  ```

- **Headers**

  ```
  Content-Type: multipart/form-data
  Authorization: Bearer <token>
  ```

- **Request Body**

  ```
  model_name: [string],
  image: [file]
  ```

- **Response**
  ```json
  {
    "error": false,
    "message": "Successfully create detection!",
    "detectionResults": {
        "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "imageUrl": "https://storage.googleapis.com/xxx.appspot.com/detections/xxx.png-xxxxxxxxxxxxx",
        "model_name": "xxxxxx",
        "userId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "createdAt": "xxxxxx"
    }
  }
  ```

### 2. **All Detections**

- **URL**

  ```
  /detections
  ```

- **Method**

  ```
  GET
  ```

- **Headers**

  ```
  Authorization: Bearer <token>
  ```

- **Response**
  ```json
  {
    "error": false,
    "message": "Successfully get detections!",
    "detectionResult": [
      {
        "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "imageUrl": "https://storage.googleapis.com/xxx.appspot.com/detections/xxx.png-xxxxxxxxxxxxx",
        "model_name": "xxxxxx",
        "userId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "createdAt": "xxxxxx"
      },
      ...
    ]
  }
  ```

### 3. **Detail Detection**

- **URL**

  ```
  /detections/detail/:id
  ```

- **Method**

  ```
  GET
  ```

- **Headers**

  ```
  Authorization: Bearer <token>
  ```

- **URL Parameters**

  ```
  id: [string]
  ```

- **Response**
  ```json
  {
    "error": false,
    "message": "Successfully get detection!",
    "detectionResult": {
        "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "imageUrl": "https://storage.googleapis.com/xxx.appspot.com/detections/xxx.png-xxxxxxxxxxxxx",
        "model_name": "xxxxxx",
        "userId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "createdAt": "xxxxxx"
    },
  }
  ```

### 4. **Delete Detection**

- **URL**

  ```
  /detections/delete/:id
  ```

- **Method**

  ```
  DELETE
  ```

- **Headers**

  ```
  Authorization: Bearer <token>
  ```

- **URL Parameters**

  ```
  id: [string]
  ```

- **Response**
  ```json
  {
    "error": false,
    "message": "Successfully delete detection!"
  }
  ```

---

Dengan dokumentasi di atas, pengguna dapat memahami bagaimana cara menggunakan API saya, termasuk endpoint yang tersedia, Method yang digunakan, serta format respons yang dihasilkan.