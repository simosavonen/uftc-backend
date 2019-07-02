# REST requests

Use these with the "REST Client" plugin for VS Code

Jos aloitat tyhjän tietokannan kanssa, aja REST pyynnöt järjestyksessä:

1. `user_create.rest`
2. `user_login.rest` ota tästä token leikepöydälle talteen
3. `user_get_details.rest`
4. `activity_create.rest` Tee tämä ennen kuin luot haasteen, muuten activities[] on tyhjä
5. `challenge_create.rest`
6. `workout_create.rest` tarvii tokenin, challenge.id ja activity.id

Nämä eivät tarvitse tokenia

- `challenge_list_all.rest`
- `activity_list_all.rest`
- `workout_list_all.rest`
- `scores_list_all.rest`
