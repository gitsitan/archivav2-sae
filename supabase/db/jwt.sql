\set jwt_secret 'super-secret-jwt-token-with-at-least-32-characters-long'
\set jwt_exp '3600'

ALTER DATABASE postgres SET "app.settings.jwt_secret" TO :'jwt_secret';
ALTER DATABASE postgres SET "app.settings.jwt_exp" TO :'jwt_exp';
