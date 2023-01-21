import admin from "firebase-admin";

var serviceAccount = {
  type: "service_account",
  project_id: "social-post-with-image",
  private_key_id: "6b326136dbb0f277e76e71f60d2d2904f7a18e3e",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCWzb1XifXjkrFd\nYBBoMeEqFPDeZvGhiTkxkOiLS+p+qnDWNS9lBSM4/FxQYvLXzcFm8VXTtxFxncn0\nCS2a5GWfbuimdkMtRAvbt6mrzMGTtoVigLL9qqCDv3Pp7ORCKuzsvVQ6E/Dl0ApY\nIHPa1nsNZ4y6MCm+iqhQNsGbBTJu8BnrqoJkhuIkmMS1cac9BAAZiu2O3AV/HJrM\n4LCnNmfNJjSpjTIi760NjehOequBF8VqoEQONGn2JkpQiTzsaxsK4whJ1nAEkHQ6\nCdaOn0dPbvlxY+E0847hR0dqJMGfz4T2ps2kHcF0nXm567P4+q8fM9g0yai4l+ul\n048YyqnTAgMBAAECggEACoh1RKOAtrP8ynJWwwhU200aI9aZ4vgENCeUboJPbyh1\neCi/1jT9KFJMGltG7fbTnt6VaZO8Vqy4OeDYPBze0jt7aYESIRvDHkYeRj8neCtD\n9sTZe6lKy9j3/itLKCn6YXC57NKOvWaCCnS90tevQZjtdeW+TK4/olaowCylQKVO\nFfrQ2fchIlFH3Cej46hs2wLvgd/NbdNm0/u2FukQVPB79UTpEOWsHMY7O9bOdBEI\nZZQWHUDIX7IKZ9GAErtmZyt4LcG73bNa0TdrXxvQV6VZgHrnXTi9ogDM+oGITiJB\nLhqY5iPRsab87FXErQXSUFt/tL4k06SAddlglBhOCQKBgQDPCG/d0NnN77VpTI9O\nXBzmmv5m2OIj08QZWCJvC56twZ7H/y/uhiigwkx+97cfiPFpnHAb2801/gSK/KTb\nhoaVZL/tBwnPagpe8HJtlZkovyS/K1DojKrTw6Fg757rwzUUCcGOcOnaEEVFx07a\njABptRjAIjiHcp1c6Cz7opIN+QKBgQC6eLIxjMU0kAYa4AGF90iMpiDIxQ8ITovk\nkBay4OdvcKACcsgQQWGunxGmhIlsbzBCb9ekzvHrb1B3uQLWjKaTp4rbb+Fecnf1\n/jfiTVJSKEkLgFqe8gtVJkrTh9Ue5DSx1chcb5cgGi1GlLPj3hZpMmoOv1RyWYGj\n8ewfq00ZKwKBgQCaClMBnbWQ7nvyHw65ZPvz8Pq8lz6bHaNYoCTurpyf9+ImOI73\nUEbGZgr4pWNRSVkmFUms0Lw9IgVLTHN1CwD0AwRyXbxE4UdaIFljg91zXdT/kEEg\n5hjsezCFqYR7MsE5aZDkZMr6fwSryIG5RlXAUQhbXJrm3LaNPArMJ8e4MQKBgBk0\n1YmjKMk5KsoZO7t7OOBiWI4rLSQHUhu8aoUVp9NFmyuZjne8DtNHB2DGC7mPsitY\n6QKLQuJ7cposdTjBXIcbH8cX8ZQNzy9+hNlfcGBQt8cJO7a+q0+AVJ8RfnqliIX9\niw8LupcJUtN2qHaF/+uKeBG0RVsLxF2AB1YkltBvAoGAU1TqTqJ7GjFUNqwtc2Op\nSQA3LshmiwZxsG26y5ASVmahbiCpy/Fn3SfPGOxjZeMZtnmF+QknrFuCrXPGYi8Y\n5eqnpnJmfO0XTTidV1WU93tYvT9wYVjqrYF/0eTQqCNcKugfh3MKs+HNp/HB6tyS\na0cCMrC6NEkgy6ZdOeElM2A=\n-----END PRIVATE KEY-----\n",
  client_email:
    "firebase-adminsdk-q8pqz@social-post-with-image.iam.gserviceaccount.com",
  client_id: "114794637209608717453",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-q8pqz%40social-post-with-image.iam.gserviceaccount.com",
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://social-post-with-image.firebaseio.com"
});

const bucket = admin.storage().bucket("gs://social-post-with-image.appspot.com");
export default bucket;