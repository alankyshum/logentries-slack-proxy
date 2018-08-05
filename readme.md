# logentries-slack-proxy

This is a fully functional webhook server that forwards (proxy) logentries logs to slack channel.

## What does this thing do?
- Forward logs from logentries to slack channel

## Workflow

### Start server
```bash
npm i
npm run build
npm start
```

### Set Webhook path
1. Follow this [guide from LogEntries](https://blog.rapid7.com/2014/03/26/hipchat-pagerduty-campfire-integrations-webhooks/)
1. Follow this [guide from Slack](https://api.slack.com/incoming-webhooks) to get your unique channel url
1. Set the *webhook url* to `<hostname>/logentries-webhook?slack_webhook=<slack_channel_id>`
    - `hostname`: The publicly accessible server your deployed to (e.g. using `ngrok`, or deploy to somewhere else)
    - `slack_channel_id`: Encoded webhook path you created after following the Slack's guide on webhook
        - (e.g.) `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX`
        - Then you encode the part `T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX`
        - in javascript, you can `encodeURIComponent('T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX')` to get that `slack_channel_id`

### Developing on this server
```bash
npm run dev # monitors change of files --> build
# deploy to whichever service you want
```

## More

### Configure VSCode
`tasks.json`
```json
{
  "tasks": [
    {
      "identifier": "typescript",
      "type": "typescript",
      "tsconfig": "tsconfig.json",
      "problemMatcher": [ "$tsc" ],
      "group": {
        "kind": "build",
        "isDefault": true
      }
    }
  ]
}
```

`launch.json`
```json
{
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug TypeScript in Node.js",
      "preLaunchTask": "typescript",
      "program": "${workspaceFolder}/src/index.ts",
      "cwd": "${workspaceFolder}",
      "protocol": "inspector",
      "outFiles": [
        "${workspaceFolder}/dist/**/*.js"
      ]
    }
  ]
}
```

### Configure tsconfig.json
> You don't need to configure this if you use the `tsconfig.json` from this repo
> Otherwise, make sure you have enabled the following flags
```javascript
{
  "target": "es2015", // so that you can use e.g. Promise as a function
  "module": "commonjs",
  "sourceMap": true, // for debugging
  "outDir": "./dist", // path you are distributing your files
  "esModuleInterop": true, // need to in order to run compiled files on node
}
```

* Reference: https://medium.com/@dupski/debug-typescript-in-vs-code-without-compiling-using-ts-node-9d1f4f9a94a

## TODOs
- [ ] Package the modules in `/lib` as npm package
