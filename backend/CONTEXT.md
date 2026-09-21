# Boilerplate API

A domain-free starting point for applications: who can sign in, and a generic way to expose any record over REST. New applications add their own terms here.

## Language

**User**:
A person or system that can sign in. Stored in the `AuthEntity` collection, managed by administrators under `/users`.
_Avoid_: Account, member

**Role**:
What a User may do: `ADMIN` manages Users, `USER` is everyone else.
_Avoid_: Permission, group

**Resource**:
A record type exposed over REST through the generic controller, service and repository (Users are the reference Resource).
_Avoid_: Model, entity (in conversation; `Entity` is fine in code)

**Public route**:
A route reachable without signing in, marked `@Public()`. Every other route requires a User.
_Avoid_: Open endpoint

**Language**:
The locale a response is written in, `fa` or `en`, chosen per request and falling back to the configured default.
_Avoid_: Locale (in conversation)
