## Deployment to GitHub - Checklist

- [ ] Inspect existing root files and confirm current entrypoints
- [x] Add root `.gitignore` (ignore server/.env, node_modules, client/dist)
- [x] Add `server/.env.example` with required env vars
- [x] Add root `README.md` with setup/run instructions

- [x] Add production static hosting support in `server/server.js`
- [x] Update `server/package.json` scripts for client build + prod start
- [x] Add GitHub Actions workflow for install/build checks
- [ ] Ensure build succeeds locally (client build + server start in production mode)





