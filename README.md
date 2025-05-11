# U.S. States REST API

This is a RESTful API built with **Node.js**, **Express**, and **MongoDB** that provides information and fun facts about U.S. states. Static state data is combined with dynamic MongoDB content for features like adding, updating, and deleting fun facts.

## Features

- Get all U.S. states or filter by contiguous/non-contiguous.
- Retrieve specific state data like:
  - Capital
  - Nickname
  - Population
  - Admission date
- Get a random fun fact for a state.
- Add fun facts (array of strings) to a state.
- Update or delete a specific fun fact by index (1-based).
- Fully RESTful routes with descriptive error handling.

## Endpoints

### GET Requests

- `GET /states` – All states
- `GET /states?contig=true|false` – Filter contiguous or non-contiguous
- `GET /states/:state` – Details of one state
- `GET /states/:state/capital`
- `GET /states/:state/nickname`
- `GET /states/:state/population`
- `GET /states/:state/admission`
- `GET /states/:state/funfact` – Get a random fun fact

### POST Request

- `POST /states/:state/funfact`
  - Body: `{ "funfacts": ["Fact 1", "Fact 2"] }`

### PATCH Request

- `PATCH /states/:state/funfact`
  - Body: `{ "index": 1, "funfact": "Updated fact" }`

### DELETE Request

- `DELETE /states/:state/funfact`
  - Body: `{ "index": 1 }`

## Project Structure

Glitch link: 
    https://nebula-juvenile-cappelletti.glitch.me
