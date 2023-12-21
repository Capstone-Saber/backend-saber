<p align="center">
  <img src="image/logo.png" alt="Saber logo" height="180" />
</p>

<h1 align="center">Saber Backend Service</h1>

---

## Cloud Architecture

<p align="center">
  <img src="image/cloud-architecture.png" alt="Cloud Architecture" />
</p>

## Web Service

> Base URL: https://saber-backend-gquk47qgta-et.a.run.app/

The service available:

- Users
  <pre>POST /v1/users/register</pre>
  <pre>POST /v1/users/login</pre>
  <pre>GET  /v1/users/</pre>

- Electricities
  <pre>POST /v2/electricities</pre>
  <pre>GET  /v2/electricities/usages</pre>
  <pre>GET  /v2/electricities/usages/hour</pre>

For more information, please click [here](https://saber-backend-gquk47qgta-et.a.run.app/api-docs/)

## How to setup locally

Make sure you have node v16.0.0 (minimum) installed. <br> <br>

You need to install all package dependencies using command:

```text
npm i
```

Before you run this project, you need to configure the following environment variables:

```bash
PORT = {your server port}
JWT_SECRET = {your JWT secret key}
PROJECT_ID = {your google cloud platform project id}
TZ = UTC
```

Start a service using command:

```text
npm run dev
```

To run on development environment.

or

```text
npm run start
```

To run on production environment.
